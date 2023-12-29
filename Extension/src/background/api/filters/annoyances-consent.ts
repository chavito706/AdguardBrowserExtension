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

import { Log } from '../../../common/log';
import { annoyancesConsentStorageDataValidator } from '../../schema';
import { annoyancesConsentStorage } from '../../storages';

/**
 * Class for managing annoyances filters consent.
 */
export class AnnoyancesConsentApi {
    private readonly consentedFilterIds: Set<number>;

    /**
     * Creates an instance of {@link AnnoyancesConsentApi}.
     */
    constructor() {
        this.consentedFilterIds = new Set<number>();
    }

    /**
     * Returns an array of consented annoyances filter ids from storage.
     *
     * @returns An array of consented annoyances filter ids.
     */
    private static async getFromStorage(): Promise<number[]> {
        let data: number[] = [];
        try {
            const storageData = await annoyancesConsentStorage.read();
            if (typeof storageData === 'string') {
                data = annoyancesConsentStorageDataValidator.parse(JSON.parse(storageData));
                annoyancesConsentStorage.setCache(data);
            } else {
                data = [];
                annoyancesConsentStorage.setData(data);
            }
        } catch (e) {
            // eslint-disable-next-line max-len
            Log.warn(`Cannot parse data from "${annoyancesConsentStorage.key}" storage, set default states. Origin error: `, e);
            data = [];
            annoyancesConsentStorage.setData(data);
        }
        return data;
    }

    /**
     * Resets consented annoyances filter ids to empty array.
     */
    public static async reset(): Promise<void> {
        annoyancesConsentStorage.setData([]);
    }

    /**
     * Adds filter ids to the list of consented annoyances filter ids.
     *
     * @param filterIds Filter ids.
     */
    public async addFilterIds(filterIds: number[]): Promise<void> {
        if (this.consentedFilterIds.size === 0) {
            const consentedFilterIds = await AnnoyancesConsentApi.getFromStorage();
            consentedFilterIds.forEach((id) => {
                this.consentedFilterIds.add(id);
            });
        }

        filterIds.forEach((filterId) => {
            this.consentedFilterIds.add(filterId);
        });

        annoyancesConsentStorage.setData(Array.from(this.consentedFilterIds));
    }

    /**
     * Checks whether the filter is consented.
     *
     * @param id Filter id.
     *
     * @returns True if consent is granted for filter, otherwise false.
     */
    public async isConsentedFilter(id: number): Promise<boolean> {
        return this.consentedFilterIds.has(id);
    }
}

export const annoyancesConsent = new AnnoyancesConsentApi();
