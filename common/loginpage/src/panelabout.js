/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/*
    'about' panel
    controller + view
*/

+function(){ 'use strict'
    var ControllerAbout = function(args={}) {
        args.caption = 'About panel';
        this.action = "about";
    };

    ControllerAbout.prototype = Object.create(baseController.prototype);
    ControllerAbout.prototype.constructor = ControllerAbout;

    var ViewAbout = function(args) {
        var _lang = utils.Lang;

        args.tplPage = `<div class="action-panel ${args.action}"></div>`;
        args.itemcls = 'bottom extra';
        args.menu = '.main-column.tool-menu';
        args.field = '.main-column.col-center';
        // args.itemindex = 3;
        args.itemtext = _lang.actAbout;
        args.tplItem = 'nomenuitem';

        baseView.prototype.constructor.call(this, args);
    };

    const version = function(commercial) {
        return commercial === true ? utils.Lang.strVersionCommercial : utils.Lang.strVersionCommunity;
    };

    // #1363: these links leave the app - the system's web browser opens them - and
    // nothing said so. Their tooltip now gives the address and says where it opens.
    const markWebLinks = function($body) {
        $body.find('a[target="popup"]').each(function() {
            const href = this.getAttribute('href') || '';
            if ( /^https?:\/\//i.test(href) )
                this.setAttribute('title', `${utils.Lang.tipOpensInBrowser}\n${href}`);
        });
    };

    ViewAbout.prototype = Object.create(baseView.prototype);
    ViewAbout.prototype.constructor = ViewAbout;
    ViewAbout.prototype.paneltemplate = function(args) {
        var _opts = args.opts;
        !!_opts.active && (_opts.edition = !!_opts.edition ? _opts.edition + ' ' + _opts.active : _opts.active);
        _opts.edition = !!_opts.edition ? `<div id="idx-ver-edition" class="about-field">${_opts.edition}</div>` : '';
        const strVersion = version(args.opts.commercial);

        let _ext_ver = '';
        if ( !!_opts.arch ) _ext_ver += _opts.arch;
        if ( !!_opts.pkg ) _ext_ver += ` ${_opts.pkg}`;
        if ( !!_ext_ver ) _opts.version += ` (${_ext_ver.trim()})`;

        var _lang = utils.Lang;
        const _updates_status = `<section id="idx-update-cnt">
                                    <div class="status-field hbox">
                                        <svg class="icon" id="idx-update-status-icon">
                                            <use href=""></use>
                                        </svg>
                                        <label id="idx-update-status-text"></label>
                                    </div>
                                    <div class="status-field">
                                        <button id="idx-update-btnaction" class="btn btn--landing btn-update-action"></button>
                                    </div>
                                </section>`;
        let _html = `<div class="flexbox">
                        <div class="box-ver">
                            <section class="hbox">
                                <!-- The Ration Docs wordmark. idx-logo-light/dark are the
                                     ONLYOFFICE mark and must not stand in for ours here: the
                                     additional terms grant no trademark rights, and showing
                                     their logo in a rebranded About box misidentifies the
                                     product. Artwork: common/loginpage/res/img/ration-wordmark.png -->
                                <div id="idx-about-cut-logo" class="${_opts.logocls}">
                                    <img class="ration-about-logo" alt="Ration Docs"
                                         src="data:image/png;base64,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">
                                </div>
                                <div class="vbox">
                                    <p id="idx-about-appname">${_opts.appname}</p>
                                    <p id="idx-about-version"><span l10n>${strVersion}</span> ${_opts.version}</p>
                                </div>
                            </section><p></p>
                            <div class="separator"></div>
                            ${_updates_status}
                            <div class="box-copyright">
                                <div id='id-features-available' l10n>${_lang.aboutProFeaturesAvailable}</div>
                                ${_opts.edition}
                                <a class="ver-checkupdate link hidden" draggable='false' data-state='check' href="#" l10n>${_lang.checkUpdates}</a>
                                <div class="about-field"><a class="ver-changelog link" draggable='false' target="popup" href=${_opts.changelog} l10n>${_lang.aboutChangelog}</a></div>
                                <!-- #670: where to report a problem - our support page
                                     (SUPPORT_URL in package/Makefile), not ONLYOFFICE's tracker -->
                                <div class="about-field"><a class="ver-report link" draggable='false' target="popup" href="https://ration.works/support" l10n>${_lang.aboutReportIssue}</a></div>
                                <a class="ver-site link about-field" target="popup" href="${_opts.link}">${_opts.site}</a>
                                <div class="ver-copyright about-field">${_opts.rights}</div> 
                            </div>                    

                              <!-- Open Source Notices.
                                   Required, not decorative. The additional terms oblige a modified
                                   version to let users identify ONLYOFFICE as the original developer
                                   (s.3 i), see that this build is modified (s.2, s.3 ii) and reach the
                                   licence (s.3 iii); AGPL s.6 requires directions to the Corresponding
                                   Source; s.1 requires upstream copyright retained; s.4 grants no
                                   trademark rights, hence the attribution line. -->
                              <div class="box-oss-notices">
                                  <h4 class="oss-title" l10n>${_lang.ossTitle}</h4>
                                  <p class="oss-line" l10n>${_lang.ossBasedOn}</p>
                                  <p class="oss-line" l10n>${_lang.ossOriginal}</p>
                                  <p class="oss-line" l10n>${_lang.ossPortions}</p>
                                  <p class="oss-line" l10n>${_lang.ossModified}</p>
                                  <p class="oss-line" l10n>${_lang.ossLicence}</p>
                                  <p class="oss-line oss-muted" l10n>${_lang.ossWarranty}</p>
                                  <p class="oss-links">
                                      <a class="link" draggable="false" target="popup"
                                         href="https://www.gnu.org/licenses/agpl-3.0.html" l10n>${_lang.ossViewLicence}</a>
                                      <a class="link" draggable="false" target="popup"
                                         href="https://creativecommons.org/licenses/by-sa/4.0/legalcode" l10n>${_lang.ossViewCC}</a>
                                      <a class="link" draggable="false" target="popup"
                                         href="https://ration.works/source" l10n>${_lang.ossViewSource}</a>
                                  </p>
                                  <!-- Additional term 5: the non-code elements we ship - their
                                       illustrations and icon sets - are CC BY-SA 4.0, which
                                       carries its own attribution requirement, so it is named
                                       and linked rather than folded into the AGPL line. -->
                                  <p class="oss-line oss-muted" l10n>${_lang.ossNonCode}</p>
                                  <p class="oss-line oss-muted" l10n>${_lang.ossTrademark}</p>
                                  <h4 class="oss-title" l10n>${_lang.ossTechnical}</h4>
                                  <dl class="oss-tech">
                                      <dt l10n>${_lang.ossBaseline}</dt><dd id="idx-oss-baseline">ONLYOFFICE 9.4.0</dd>
                                      <dt l10n>${_lang.ossBuild}</dt><dd id="idx-oss-build">${_opts.version || ''}</dd>
                                  </dl>
                              </div>
                        </div>`+
                        // '<div class="box-license flex-fill">'+
                        //   '<iframe id="framelicense" src="license.htm"></iframe>'+
                        // '</div>'+
                    '</div>';

        if (window.utils.inParams.osver == 'winxp' || /windows nt 5/i.test(navigator.appVersion)) {
            _html = _html.replace(' href=', ' xlink:href=');
        }

        return _html;
    };

    window.ControllerAbout = ControllerAbout;

    utils.fn.extend(ControllerAbout.prototype, (function() {
        let features = undefined;
        let action = null;

        let _on_features_avalable = function (params) {
            if ( !!this.view ) {
                let _label = $('#id-features-available', this.view.$body);
                if ( _label )
                    if ( !!params )
                        _label.show();
                    else _label.hide();
            }

            if ( !Array.isArray(params) ) params = [];
            sdk.execCommand('extra:features', JSON.stringify({available:params}));
        };

        const _on_native_message = function(cmd, param) {
            if (/app\:version/.test(cmd)) {
                let args = {action: this.action};
                try {
                    args.opts = JSON.parse( $('<div>').html(param).text() );
                } catch (e) {
                    delete args.opts;
                }

                if (args.opts) {
                    !args.opts.site && (args.opts.site = utils.skipUrlProtocol(args.opts.link));
                }

                if (!this.view) {
                    this.view = new ViewAbout(args);
                    this.view.args = args;
                    this.view.$menuitem && this.view.$menuitem.removeClass('extra');
                    this.view.$body = $(this.view.paneltemplate(args));
                    markWebLinks(this.view.$body);
                    this.view.$dialog = new AboutDialog();
                } else {
                    if ( !!args.opts && !!args.opts.edition ) {
                        $('#idx-ver-edition', this.view.$body).html(args.opts.edition);
                    }
                }

                // const $label = this.view.$panel.find('.ver-checkupdate');
                // $label.on('click', (e) => {
                //     if ( performance.now() - last_click_time < 1000 ) return;
                //     last_click_time = performance.now();

                //     window.sdk.execCommand('update', $label.data('state'));
                // });
                // $label[this.updates===true?'show':'hide']();
                if ( args.opts ) {
                    this.view.$body.find('.ver-changelog')[!!args.opts.changelog?'show':'hide']();
                }

                if ( !!features && features.length )
                    _on_features_avalable.call(this, features);
            } else
            if (/^updates:turn/.test(cmd)) {
                this.updates = param == 'on';

                if ( this.view ) {
                    // this.view.$panel.find('.ver-checkupdate')[this.updates?'show':'hide']();
                    this.view.$body.find('#idx-update-cnt')[this.updates?'show':'hide']();

                    if ( this.updates ) {
                        $('body').on('click', '.btn-update-action', e=>{
                            sdk.execCommand('updates:action', action);
                        });
                    }
                }
            } else
            if (/^updates:checking/.test(cmd)) {
                // const $label = this.view.$panel.find('.ver-checkupdate');
                // const opts = JSON.parse(param);
                // if ( opts.version == 'no' ) {
                //     $label.text(utils.Lang.updateNoUpdates);
                // } else {
                //     $label.text(utils.Lang.updateAvialable.replace('$1', opts.version));
                //     $label.data('state', 'download');
                // }
                // $label.show();
            } else
            if (/updates:download/.test(cmd)) {
                // const opts = JSON.parse(param);
                // const $label = this.view.$panel.find('.ver-checkupdate');

                // if ( opts.progress == 'done' ) {
                //     $label.text(utils.Lang.updateDownloadFinished);
                //     $label.data('state', 'install');
                // } else
                // if ( opts.progress == 'aborted' ) {
                //     $label.text(utils.Lang.updateDownloadCanceled);
                // } else {
                //     $label.text(utils.Lang.updateDownloadProgress.replace('$1', opts.progress));
                //     $label.data('state', 'abort');
                // }
            } else
            if (/updates:link/.test(cmd)) {
                // const $label = this.view.$panel.find('.ver-checkupdate');
                // let opts = {};
                // if ( param == 'lock' || param == 'unlock' )
                //     opts.disabled = param == 'lock';
                // else opts = JSON.parse(param);

                // if ( opts.disabled != undefined ) {
                    // $label.attr('disabled', opts.disabled ? 'disabled' : false);
                // }
            } else
            if (/updates:status/.test(cmd)) {
                on_updates_info.call(this, JSON.parse(param))
            }
        };

        const on_updates_info = function(info) {
                if ( info.text ) {
                    $('#idx-update-status-text', this.view.$body).text(info.text);
                }

                if ( info.icon ) {
                    const $icon = $('#idx-update-status-icon', this.view.$body);

                    let icon_id;
                    switch (info.icon) {
                    case 'error': icon_id = 'error'; break;
                    case 'load': icon_id = 'load'; break;
                    case 'lastcheck': icon_id = 'lastcheck'; break;
                    default: icon_id = 'success'; break;
                    }

                    $icon.attr('data-icon', icon_id);
                    $('use', $icon).attr('href', `#${icon_id}`)
                }

                if ( info.button ) {
                    const $button = $('#idx-update-btnaction', this.view.$body);
                    if ( info.button.text ) {
                        $button.text(info.button.text);
                        action = info.button.action;
                    }

                    if ( info.button.lock ) {
                        $button.disable(info.button.lock=='true');
                    }

                    if ( info.button == 'lock' ) {
                        $button.disable(true);
                    } else
                    if ( info.button == 'unlock' ) {
                        $button.disable(false);
                    }

                }
        }

        const onPanelShow = function(panel) {
            if (panel === this.action) {
                this.view.$dialog.show();
                this.view.$dialog.setBody(this.view.$body);
            }
        }

        return {
            init: function() {
                baseController.prototype.init.apply(this, arguments);

                window.sdk.on('on_native_message', _on_native_message.bind(this));

                if ( utils.brandCheck('onfeaturesavailable') ) {
                    features = sdk.GetLocalFeatures();
                    if ( !!features && features.length )
                        _on_features_avalable.call(this, features);

                    sdk.on('onfeaturesavailable', _on_features_avalable.bind(this));
                } else sdk.GetLocalFeatures = e => false;

                CommonEvents.on('panel:show', onPanelShow.bind(this));
                CommonEvents.on('lang:changed', () => {
                    if (this.view) {
                        this.view.$dialog.titleText = utils.Lang.actAbout;
                        $('#idx-about-version span', this.view.$body).text(version(this.view.args.opts.commercial));
                        markWebLinks(this.view.$body);
                    }
                });

                return this;
            },
            onfeaturesavailable: _on_features_avalable
        }
    })());
}();

/*
*   controller definition
*/

// window.CommonEvents.on('main:ready', function(){
//     var p = new ControllerAbout({});
//     p.init();
// });
