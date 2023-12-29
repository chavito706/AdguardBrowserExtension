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

import { ANNOYANCES_CONSENT_KEY } from '../../common/constants';
import { AnnoyancesConsentStorageData } from '../schema';
import { StringStorage } from '../utils/string-storage';

import { storage } from './main';

/**
 * Class for asynchronous control annoyances consent storage data.
 *
 * @see {@link StringStorage}
 */
export class AnnoyancesConsentStorage extends StringStorage<
    typeof ANNOYANCES_CONSENT_KEY,
    AnnoyancesConsentStorageData,
    'async'
> {
    /**
     * Adds filter ids to storage.
     *
     * @param filterIds Filter ids.
     *
     * @throws Error if the data is not initialized.
     */
    addFilterIds(filterIds: number[]): void {
        if (!this.data) {
            throw AnnoyancesConsentStorage.createNotInitializedError();
        }

        if (!this.data) {
            this.data = [];
        }

        filterIds.forEach((id) => {
            if (this.data && !this.data.includes(id)) {
                this.data.push(id);
            }
        });
    }

    /**
     * Helper function to create a basic {@link Error} with a custom message.
     *
     * @returns A basic {@link Error} with a custom message.
     */
    private static createNotInitializedError(): Error {
        return new Error('annoyances consent is not initialized');
    }
}

/**
 * Instance of {@link AnnoyancesConsentStorage} that stores filter ids for granted consent of
 * annoyances filters in {@link storage} under {@link ANNOYANCES_CONSENT_KEY} key.
 */
export const annoyancesConsentStorage = new AnnoyancesConsentStorage(
    ANNOYANCES_CONSENT_KEY,
    storage,
);
