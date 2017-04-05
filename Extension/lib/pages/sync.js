/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */
var PageController = function () {
};

PageController.prototype = {

    init: function (status) {
        this._render(status);
    },

    _render: function (status) {
        var statusText =
            'Sync enabled: ' + status.enabled + '<br/>'
            + 'Last sync time: ' + (status.lastSyncTime ? new Date(parseInt(status.lastSyncTime)) : '') + '<br/>'
            + 'Current provider: ' + status.syncProvider + '<br/>'
            + 'Oauth supported: ' + status.isOathSupported + '<br/>'
            + 'Auth: ' + status.isAuthenticated + '<br/>';

        $("#statusPlaceholder").html(statusText);

        var refreshAuthButton = $('#refreshAuth');
        var logoutAuthButton = $('#logoutAuth');
        if (status.isOathSupported) {
            if (status.isAuthenticated) {
                refreshAuthButton.hide();

                logoutAuthButton.show();
                logoutAuthButton.click(function () {
                    contentPage.sendMessage({type: 'dropAuthSync'}, function () {
                        document.location.reload();
                    });
                });
            } else {
                refreshAuthButton.show();
                refreshAuthButton.click(function () {
                    contentPage.sendMessage({type: 'authSync'}, function () {
                        document.location.reload();
                    });
                });

                logoutAuthButton.hide();
            }
        } else {
            refreshAuthButton.hide();
            logoutAuthButton.hide();
        }

        if (status.enabled) {
            $('#toggleStatus').text('Disable sync');
        } else {
            $('#toggleStatus').text('Enable sync');
        }

        $('#toggleStatus').click(function () {
            contentPage.sendMessage({type: 'toggleSync'}, function () {
                document.location.reload();
            });
        });

        $('#syncNow').click(function () {
            contentPage.sendMessage({type: 'syncNow'}, function () {
                document.location.reload();
            });
        });

        $('#dropboxProvider').click(function () {
            contentPage.sendMessage({type: 'setSyncProvider', provider: 'DROPBOX'}, function () {
                document.location.reload();
            });
        });

        $('#agSyncProvider').click(function () {
            contentPage.sendMessage({type: 'setSyncProvider', provider: 'ADGUARD_SYNC'}, function () {
                document.location.reload();
            });
        });

        $('#browserStorageProvider').click(function () {
            contentPage.sendMessage({type: 'setSyncProvider', provider: 'CHROME'}, function () {
                document.location.reload();
            });
        });
    }
};

contentPage.sendMessage({type: 'getSyncStatus'}, function (response) {

    $(document).ready(function () {
        var controller = new PageController();
        controller.init(response);
    });
});