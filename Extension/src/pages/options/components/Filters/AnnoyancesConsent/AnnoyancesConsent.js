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

import React, { useContext } from 'react';
import { observer } from 'mobx-react';

import { ConfirmModal } from '../../../../common/components/ConfirmModal';
import { reactTranslator } from '../../../../../common/translators/reactTranslator';
import { rootStore } from '../../../stores/RootStore';

export const AnnoyancesConsent = observer(({
    isOpen,
    setIsOpen,
    onConfirm,
}) => {
    const { settingsStore } = useContext(rootStore);

    // FIXME: render filters due to the design
    const renderFiltersToAskConsentFor = () => {
        const { filtersToGetConsentFor } = settingsStore;
        return `${filtersToGetConsentFor.map((filter) => filter.name).join(', ')}`;
    };

    return (
        <ConfirmModal
            title={reactTranslator.getMessage('options_filters_annoyances_consent_title')}
            subtitle={renderFiltersToAskConsentFor()}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            onConfirm={onConfirm}
            customConfirmTitle={reactTranslator.getMessage('options_filters_annoyances_consent_enable_button')}
        />
    );
});
