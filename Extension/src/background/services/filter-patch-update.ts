/**
 * @file
 * This file is part of AdGuard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * AdGuard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * AdGuard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with AdGuard Browser Extension. If not, see <http://www.gnu.org/licenses/>.
 */
import { applyPatch } from '@adguard/diff-builder/diff-updater/es';
import FiltersDownloader from '@adguard/filters-downloader/browser';

import {
    CustomFilterApi,
    FiltersApi,
    network,
} from '../api';
import {
    FiltersStorage,
    RawFiltersStorage,
    customFilterMetadataStorage,
    filterVersionStorage,
    settingsStorage,
} from '../storages';
import { SettingOption } from '../schema';
import { CustomFilterParser } from '../api/filters/custom/parser';
import { Log } from '../../common/log';
import { Engine } from '../engine';

/**
 * Service for scheduling filters update checks.
 *
 * After initialization scheduler checks filter updates
 * {@link CHECK_PERIOD_MS every 30 seconds}.
 */
export class FilterPatchUpdateService {
    /**
     * Checking period - 30 seconds.
     */
    private static readonly CHECK_PERIOD_MS = 1000 * 15; // 30 seconds

    /**
     * Stores scheduler timer id for checking update in every
     * {@link CHECK_PERIOD_MS} time.
     */
    private schedulerTimerId: number | undefined;

    /**
     * Creates new {@link FilterUpdateService}.
     */
    constructor() {
        this.update = this.update.bind(this);
    }

    /**
     * Schedules filters update check for every {@link CHECK_PERIOD_MS} period.
     */
    public async init(): Promise<void> {
        // this.schedulerTimerId = window.setTimeout(async () => {
        //     await this.update();
        // }, FilterPatchUpdateService.CHECK_PERIOD_MS);
    }

    /**
     *
     * @param filterId
     */
    private static async tryToApplyPatch(filterId: number): Promise<void> {
        const filterContent = await FiltersStorage.get(filterId);

        try {
            let url = '';
            if (CustomFilterApi.isCustomFilter(filterId)) {
                const filterMetadata = customFilterMetadataStorage.getById(filterId);

                if (!filterMetadata) {
                    Log.error(`Cannot find custom filter ${filterId} metadata`);
                    return;
                }

                const { customUrl } = filterMetadata;
                url = customUrl;
            } else {
                const isOptimized = settingsStorage.get(SettingOption.UseOptimizedFilters);
                url = network.getUrlForDownloadFilterRules(filterId, isOptimized);
            }

            const updatedFilter = await applyPatch(url, filterContent.join('\n'));

            await RawFiltersStorage.set(filterId, updatedFilter.split(/\r?\n/));

            const filterWithAppliedDirectives = await FiltersDownloader.resolveDirectives(
                url,
                updatedFilter.split(/\r?\n/),
                network.conditionsConstants,
            );
            await FiltersStorage.set(filterId, filterWithAppliedDirectives);

            const filterMetadata = CustomFilterParser.parseFilterDataFromHeader(filterWithAppliedDirectives);
            if (!filterMetadata) {
                throw new Error(`Not found metadata for filter id ${filterId}`);
            }

            const {
                version,
                expires,
                timeUpdated,
            } = filterMetadata;

            filterVersionStorage.set(filterId, {
                version,
                expires: Number(expires),
                lastUpdateTime: new Date(timeUpdated).getTime(),
                lastCheckTime: Date.now(),
            });

            Engine.debounceUpdate();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }

    /**
     * Checks every {@link CHECK_PERIOD_MS} period whether the enabled filters
     * should be updated with setTimeout which saved to {@link schedulerTimerId}.
     */
    public async update(): Promise<void> {
        // window.clearTimeout(this.schedulerTimerId);

        const filtersIds = FiltersApi.getInstalledAndEnabledFiltersIds();

        const tasks = filtersIds.map((id) => FilterPatchUpdateService.tryToApplyPatch(id));

        await Promise.all(tasks);

        // this.schedulerTimerId = window.setTimeout(async () => {
        // await this.update();
        // }, FilterPatchUpdateService.CHECK_PERIOD_MS);
    }
}

export const filterPatchUpdateService = new FilterPatchUpdateService();
