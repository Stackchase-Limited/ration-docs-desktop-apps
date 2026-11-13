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

'use strict';
$(document).ready(function() {
    const _toolmenu_tpl = `
            <div class="main-column col-left tool-menu ration-sidebar">
              <!-- The Ration logo is inline SVG, not a linked file: this markup is a
                   JavaScript string, so the build's HTML inliner never sees a
                   reference in it. Inline also lets the stylesheet recolour it per
                   theme (petrol and black on light, white on dark). -->
              <div class="ration-brand">
                <svg viewBox="99 33 124 37" role="img" aria-label="Ration" focusable="false" class="ration-logo" preserveAspectRatio="xMinYMid slice"><path fill-rule="evenodd" clip-rule="evenodd" d="M107.692 38.7727C108.934 38.7727 109.992 39.561 110.391 40.6627C110.785 41.4673 111.701 41.8791 112.514 41.4276C112.553 41.4011 112.593 41.3775 112.632 41.3555L112.634 41.354C112.878 41.2172 113.161 41.1393 113.46 41.1393C114.398 41.1393 115.158 41.8982 115.158 42.8352C115.158 43.7721 114.398 44.5311 113.46 44.5311C112.79 44.5311 112.21 44.1427 111.934 43.5794V43.5779C111.924 43.5588 111.915 43.5382 111.906 43.5191C111.637 43.0308 110.383 42.7954 110.092 43.2058C109.579 43.9839 108.697 44.4987 107.692 44.4987C106.109 44.4987 104.826 43.2176 104.826 41.6364C104.826 40.0552 106.109 38.7727 107.692 38.7727ZM104.53 47.2786C105.226 47.2786 105.788 46.7153 105.788 46.0225C105.788 45.3283 105.226 44.7664 104.53 44.7664C103.835 44.7664 103.273 45.3283 103.273 46.0225C103.273 46.7153 103.835 47.2786 104.53 47.2786ZM103.878 57.8188C104.573 57.8188 105.136 57.2569 105.136 56.5626C105.136 55.8699 104.573 55.3065 103.878 55.3065C103.183 55.3065 102.62 55.8699 102.62 56.5626C102.62 57.2569 103.183 57.8188 103.878 57.8188ZM110.749 65.5804C111.442 65.5804 112.006 65.0186 112.006 64.3243C112.006 63.6316 111.442 63.0682 110.749 63.0682C110.053 63.0682 109.491 63.6316 109.491 64.3243C109.491 65.0186 110.053 65.5804 110.749 65.5804ZM120.958 65.9835C121.652 65.9835 122.216 65.4216 122.216 64.7274C122.216 64.0331 121.652 63.4712 120.958 63.4712C120.263 63.4712 119.7 64.0331 119.7 64.7274C119.7 65.4216 120.263 65.9835 120.958 65.9835ZM128.615 59.1984C129.309 59.1984 129.873 58.6365 129.873 57.9423C129.873 57.2495 129.309 56.6862 128.615 56.6862C127.92 56.6862 127.357 57.2495 127.357 57.9423C127.357 58.6365 127.92 59.1984 128.615 59.1984ZM129.746 49.1951C130.441 49.1951 131.006 48.6318 131.006 47.939C131.006 47.2448 130.441 46.6829 129.746 46.6829C129.053 46.6829 128.49 47.2448 128.49 47.939C128.49 48.6318 129.053 49.1951 129.746 49.1951ZM122.935 41.126C123.628 41.126 124.192 40.5642 124.192 39.8699C124.192 39.1757 123.628 38.6138 122.935 38.6138C122.239 38.6138 121.677 39.1757 121.677 39.8699C121.677 40.5642 122.239 41.126 122.935 41.126ZM119.672 36.0369C120.55 36.9135 120.74 38.2167 120.241 39.2772C119.951 40.1244 120.307 41.0643 121.203 41.3187C121.248 41.3275 121.292 41.3378 121.337 41.3511H121.338C121.608 41.4276 121.862 41.5717 122.074 41.7835C122.737 42.4454 122.737 43.5191 122.074 44.181C121.412 44.8429 120.337 44.8429 119.674 44.181C119.2 43.7074 119.064 43.0234 119.269 42.4307V42.4292C119.276 42.4086 119.283 42.388 119.291 42.3674C119.445 41.8335 118.727 40.7804 118.229 40.8642H118.23C117.316 41.054 116.328 40.7951 115.618 40.0861C114.498 38.9683 114.498 37.1547 115.618 36.0369C116.737 34.919 118.553 34.919 119.672 36.0369ZM130.198 42.866C130.198 44.106 129.409 45.1621 128.306 45.5592C127.5 45.9534 127.088 46.8697 127.54 47.6816C127.567 47.7199 127.59 47.7581 127.612 47.7993L127.614 47.8008C127.751 48.0449 127.827 48.3259 127.829 48.6259C127.829 49.5628 127.067 50.3218 126.131 50.3218C125.192 50.3218 124.432 49.5628 124.432 48.6259C124.432 47.9567 124.821 47.3772 125.385 47.1021L125.387 47.1006C125.406 47.0918 125.425 47.083 125.446 47.0742C125.935 46.805 126.17 45.5518 125.759 45.2621C124.979 44.7502 124.463 43.8677 124.463 42.866C124.463 41.2849 125.748 40.0038 127.331 40.0038C128.914 40.0038 130.198 41.2849 130.198 42.866ZM132.492 54.9741C131.614 55.8507 130.309 56.039 129.247 55.5419C128.399 55.2521 127.458 55.6081 127.203 56.5023C127.194 56.5465 127.184 56.5921 127.17 56.6362V56.6377C127.094 56.9068 126.949 57.1613 126.737 57.3731C126.075 58.035 124.999 58.035 124.337 57.3731C123.674 56.7112 123.674 55.6375 124.337 54.9741C124.811 54.5005 125.496 54.3667 126.089 54.5696L126.091 54.5711C126.111 54.577 126.132 54.5843 126.151 54.5932C126.689 54.7476 127.742 54.0284 127.658 53.5327C127.468 52.6208 127.727 51.6323 128.437 50.9249C129.556 49.8055 131.372 49.8055 132.492 50.9249C133.611 52.0427 133.611 53.8548 132.492 54.9741ZM125.873 65.2863C124.633 65.2863 123.575 64.4994 123.176 63.3962C122.781 62.5931 121.865 62.1798 121.052 62.6329C121.014 62.6579 120.974 62.6829 120.934 62.7049H120.933C120.689 62.8417 120.406 62.9197 120.107 62.9197C119.169 62.9197 118.409 62.1607 118.409 61.2238C118.409 60.2868 119.169 59.5279 120.107 59.5279C120.777 59.5279 121.357 59.9162 121.633 60.481C121.643 60.5016 121.652 60.5207 121.661 60.5398C121.93 61.0282 123.183 61.265 123.475 60.8531V60.8546C123.988 60.075 124.87 59.5602 125.873 59.5602C127.458 59.5602 128.74 60.8414 128.74 62.424C128.74 64.0052 127.458 65.2863 125.873 65.2863ZM113.809 67.9632C112.931 67.0866 112.741 65.7834 113.241 64.7229C113.531 63.8757 113.174 62.9359 112.279 62.6814C112.233 62.6726 112.189 62.6623 112.145 62.6505L112.143 62.649C111.874 62.5725 111.619 62.4284 111.407 62.2166C110.744 61.5547 110.744 60.481 111.407 59.8191C112.07 59.1572 113.145 59.1572 113.808 59.8191C114.282 60.2927 114.417 60.9767 114.213 61.5709C114.205 61.5915 114.198 61.6121 114.191 61.6327C114.036 62.1681 114.755 63.2197 115.252 63.1359H115.251C116.166 62.9461 117.154 63.2065 117.864 63.914C118.983 65.0318 118.983 66.8454 117.864 67.9632C116.744 69.0811 114.928 69.0811 113.809 67.9632ZM103.44 61.1958C103.44 59.9559 104.23 58.9013 105.333 58.5027C106.137 58.1085 106.551 57.1922 106.097 56.3803C106.072 56.342 106.049 56.3038 106.025 56.2626V56.2611C105.888 56.017 105.81 55.736 105.81 55.436C105.81 54.499 106.57 53.7401 107.508 53.7401C108.447 53.7401 109.207 54.499 109.207 55.436C109.207 56.1052 108.818 56.6847 108.254 56.9598L108.252 56.9612C108.233 56.9701 108.212 56.9789 108.193 56.9877C107.704 57.2569 107.469 58.5101 107.88 58.8013H107.878C108.659 59.3117 109.174 60.1942 109.174 61.1958C109.174 62.777 107.891 64.0581 106.308 64.0581C104.725 64.0581 103.44 62.777 103.44 61.1958ZM100.84 49.2716C101.717 48.395 103.022 48.2052 104.084 48.7039V48.7024C104.932 48.9922 105.874 48.6362 106.128 47.7434C106.137 47.6978 106.148 47.6537 106.159 47.6096L106.161 47.6066V47.6081C106.236 47.3374 106.38 47.0845 106.594 46.8727C107.257 46.2093 108.332 46.2093 108.994 46.8712C109.657 47.5345 109.657 48.6083 108.994 49.2701C108.52 49.7438 107.835 49.8791 107.242 49.6746H107.24C107.22 49.6673 107.199 49.6599 107.178 49.6526C106.642 49.4967 105.589 50.2159 105.673 50.7116C105.863 51.625 105.604 52.6119 104.894 53.3209C103.775 54.4387 101.959 54.4387 100.84 53.3209C99.7202 52.2016 99.7202 50.3895 100.84 49.2716ZM112.631 40.7995C113.325 40.7995 113.889 40.2376 113.889 39.5434C113.889 38.8506 113.325 38.2873 112.631 38.2873C111.936 38.2873 111.373 38.8506 111.373 39.5434C111.373 40.2376 111.936 40.7995 112.631 40.7995Z" class="rl-mark"></path><path d="M137.246 61.8533H141.473V53.4886C141.473 51.8471 141.56 50.9587 142.111 50.4366C142.663 49.9291 143.402 49.732 144.292 49.732C144.887 49.732 145.598 49.8571 146.459 50.1527H146.685V45.8299C146.376 45.8004 146.077 45.8004 145.781 45.8004C143.953 45.8004 142.721 46.4241 141.787 47.158L141.429 47.1389L141.149 46.149H137.246V61.8533ZM161.595 48.1185C160.443 46.6079 158.301 45.8004 155.37 45.8004C153.015 45.8004 150.54 46.733 148.515 48.22L151.018 51.0455C152.435 49.9438 154.051 49.3364 155.37 49.3364C156.376 49.3364 157.111 49.5188 157.596 49.9159C158.147 50.3454 158.316 51.0117 158.346 52.1178H155.438C152.634 52.1178 151.401 52.3737 150.467 52.8517C148.953 53.6151 148.089 55.0389 148.089 56.9569C148.089 60.1104 150.41 62.2005 154.08 62.2005C154.989 62.2005 156.019 62.071 156.986 61.593C157.31 61.4283 157.634 61.2018 157.992 60.8929H158.346L158.954 61.8533H162.571V52.3016C162.571 50.0262 162.218 48.926 161.595 48.1185ZM157.634 57.7864C156.986 58.463 155.923 58.844 154.83 58.844C153.117 58.844 152.407 58.0144 152.407 56.9848C152.407 56.5024 152.465 56.3479 152.793 55.9949C153.214 55.5169 153.697 55.4213 154.182 55.4213H158.331C158.287 56.42 158.132 57.2363 157.634 57.7864ZM172.451 62.2005C173.539 62.2005 174.7 61.9445 175.323 61.7474L174.647 58.4057C174.191 58.5351 173.683 58.6616 173.23 58.6616C172.321 58.6616 171.644 58.338 171.644 56.951V49.4511H174.772V46.149H171.644V39.339L167.509 42.3425V46.149H164.932V49.4511H167.408V57.5026C167.408 60.559 169.453 62.2005 172.451 62.2005ZM180.71 44.6899C182.176 44.6899 183.408 43.4735 183.408 41.985C183.408 40.5421 182.176 39.311 180.71 39.311C179.231 39.311 178.012 40.5421 178.012 41.985C178.012 43.5015 179.255 44.6899 180.71 44.6899ZM178.592 61.8533H182.828V46.149H178.592V61.8533ZM194.183 62.2005C199.129 62.2005 202.206 58.666 202.206 53.9578C202.206 49.2628 199.129 45.8004 194.183 45.8004C189.211 45.8004 186.161 49.2628 186.161 53.9578C186.161 58.666 189.211 62.2005 194.183 62.2005ZM194.183 58.666C191.364 58.666 190.397 56.3774 190.397 53.9578C190.397 51.553 191.364 49.3364 194.183 49.3364C196.973 49.3364 197.941 51.5279 197.941 53.9578C197.941 56.4053 196.973 58.666 194.183 58.666ZM205.499 61.8533H209.677V53.7842C209.677 52.3296 209.745 51.2147 210.258 50.4366C210.736 49.732 211.514 49.2775 212.814 49.2775C213.767 49.2775 214.517 49.5335 215.055 50.085C215.832 50.8616 215.832 52.0207 215.832 53.4312V61.8533H220V52.7841C220 51.0455 220 48.573 218.028 47.0036C217.192 46.327 215.929 45.8004 214.121 45.8004C212.448 45.8004 210.963 46.327 210.029 47.158L209.677 47.1389L209.362 46.149H205.499V61.8533Z" class="rl-text"></path></svg>
                <span class="ration-brand-name" aria-hidden="true">rationDocs</span>
              </div>
              <li class="menu-item">
                <a action="recents">
                    <div class="icon-box">
                        <svg class="icon" data-iconname="home" data-precls="tool-icon">
                            <use href="#home"></use>
                        </svg>
                    </div>
                    <span class="text" l10n>${utils.Lang.actHome}</span>
                </a>
              </li>
              <li class="menu-item">
                <a action="open">
                    <div class="icon-box">
                        <svg class="icon" data-iconname="folder" data-precls="tool-icon">
                            <use href="#folder"></use>
                        </svg>
                    </div>
                    <span class="text" l10n>${utils.Lang.actOpenLocal}</span>
                </a>
              </li>
              <li class="menu-item">
                <a l10n action="templates">
                    <div class="icon-box">
                        <svg class="icon" data-iconname="templates" data-precls="tool-icon">
                            <use href="#templates"></use>
                        </svg>
                    </div>
                    <span class="text" l10n>${utils.Lang.actTemplates}</span>
                </a>
              </li>
              <li class="menu-item separator"></li>
              <div class="rd-grp">
                <span l10n>${utils.Lang.actClouds || 'Clouds'}</span>
                <button class="rd-grp-add" action="connect" aria-label="${utils.Lang.actConnectCloud || 'Connect a cloud'}">
                  <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
              <p class="rd-cloud-empty" l10n>${utils.Lang.actNoClouds || 'No cloud connected yet.'}</p>
              <section id="idx-sidebar-portals" class="connect">
              </section>
              <li class="menu-item rd-spacer"></li>
              <!-- No static AI entry here. ControllerExternalPanel registers one menu
                   item per external-panel plugin automatically, and the AI agent plugin
                   is one, so a hardcoded entry produced TWO "AI agent" rows in the
                   sidebar. The hardcoded one was also the broken one: nothing registers
                   an ".action-panel.agent", so onActionClick hid every panel and showed
                   nothing, leaving the content area blank until another item was
                   clicked. The auto-registered entry is the one that works. -->
              <li class="menu-item rd-foot">
                  <a action="settings">
                    <div class="icon-box">
                      <svg class="icon" data-iconname="settings" data-precls="tool-icon">
                          <use href="#settings"></use>
                      </svg>
                    </div>
                    <span class="text" l10n>${utils.Lang.actSettings}</span>
                  </a>
              </li>
              <li class="menu-item hidden">
                  <a action="about">
                    <div class="icon-box">
                      <svg class="icon" data-iconname="about" data-precls="tool-icon">
                          <use href="#about"></use>
                      </svg>
                    </div>
                    <span class="text" l10n>${utils.Lang.actAbout}</span>
                  </a>
              </li>
            </div>
            <div class="main-column col-center after-left ration-content">
            </div>`;
    $('#placeholder').html(_toolmenu_tpl);

    $('.tool-menu').on('click', '> .menu-item > a', onActionClick);
    // $('.tool-quick-menu .menu-item a').click(onNewFileClick);

    if ( window.utils.isWinXp ) {
        $(document.body).addClass('win_xp');
        $('a[action] use').each((i, e) => {
            const _attr_href = e.getAttribute('href');
            if ( !!_attr_href ) {
                const $el = $(e), $parent = $el.parent();
                $el.remove();
                $parent.html(`<use xlink:href="${_attr_href}"></use>`);
            }
        });
    }

    !window.app && (window.app = {controller:{}});
    !window.app.controller && (window.app.controller = {});

    if ( !!window.ControllerTemplates )
        window.app.controller.templates = (new ControllerTemplates).init();
    window.app.controller.recent = (new ControllerRecent).init();
    window.app.controller.folders = (new ControllerFolders).init();
    window.app.controller.about = (new ControllerAbout).init();
    window.app.controller.settings = (new ControllerSettings).init();

    if (!!window.ControllerPortals)
        window.app.controller.portals = (new ControllerPortals({
            placeholder: '#idx-sidebar-portals',
        })).init();

    !!window.ControllerExternalPanel && (window.app.controller.externalpanel = (new ControllerExternalPanel({})).init());

    // if (!localStorage.welcome) {
    //     app.controller.welcome = (new ControllerWelcome).init();
    //     selectAction('welcome');

    //     localStorage.setItem('welcome', 'have been');
    // } else
    {
        if ( !!utils.inParams.panel && $(`.action-panel.${utils.inParams.panel}`).length )
            selectAction(utils.inParams.panel);
        else selectAction('recents');
    }

    if (!window.config.portals.checklist) {
        $('.tools-connect').hide();
        hideAction('connect');
        console.log('There are no cloud providers');
    }

    if (!utils.inParams.waitingloader)
        setLoaderVisible(false);

    /* test information */
    // var arr = [
    //     {"id":0,"type":utils.defines.FileFormat.FILE_CROSSPLATFORM_PDF,"path":"https://testinfo.teamlab.info/New Document.docx","modifyed":"11.12.2015 18:45"},
    //     {"id":1,"type":utils.defines.FileFormat.FILE_CROSSPLATFORM_DJVU,"path":"C:\\Users\\maxim.kadushkin\\Documents\\DPIConfig_SmallPCs.docx","modifyed":"11.12.2015 18:22"},
    //     {"id":2,"type":utils.defines.FileFormat.FILE_CROSSPLATFORM_XPS,"path":"/Users/ayuzhin/Develop/Web/test.html","modifyed":"11.12.2015 17:58"},
    //     {"id":3,"type":utils.defines.FileFormat.FILE_PRESENTATION_PPTX,"path":"https://testinfo.teamlab.info\\Sadfasd.docx","modifyed":"10.12.2015 17:25"},
    //     {"id":4,"type":utils.defines.FileFormat.FILE_SPREADSHEET_CSV,"path":"https://testinfo.teamlab.info\\Sadfasd.docx","modifyed":"10.12.2015 17:25"},
    //     {"id":5,"type":utils.defines.FileFormat.FILE_SPREADSHEET_ODS,"path":"https://testinfo.teamlab.info\\Sadfasd.docx","modifyed":"10.12.2015 17:25"},
    //     {"id":6,"type":utils.defines.FileFormat.FILE_SPREADSHEET_XLS,"path":"https://testinfo.teamlab.info\\Office 365 Value Added Reseller Guide.docx","modifyed":"10.12.2015 16:46"}
    // ];
    // window.onupdaterecents(arr);
    // window.onupdaterecovers(arr);
    /* **************** */

    setTimeout(()=>{
        if (window.sdk) {
            window.sdk.LocalFileRecovers();
            window.sdk.LocalFileRecents();

            window.sdk.execCommand('app:onready', '');
        } 
    }, 50);

    $('.scrollable').on('scroll', e => {
        if ( window.Menu && Menu.opened ) {
            Menu.closeAll();
        }
    });

    const mq = "screen and (-webkit-min-device-pixel-ratio: 1.01) and (-webkit-max-device-pixel-ratio: 1.99), " +
                                "screen and (min-resolution: 1.01dppx) and (max-resolution: 1.99dppx)";

    const mql = window.matchMedia(mq);
    mql.addEventListener('change', e => {
        CommonEvents.fire("icons:svg", [!e.target.matches]);
        replaceIcons(!e.target.matches);
    });

    replaceIcons(!mql.matches);
});

function onActionClick(e) {
    var $el = $(this);
    var action = $el.attr('action');
    const pinned = JSON.parse(localStorage.getItem('pinnedFolders') || '[]');

    if (/^custom/.test(action)) return;

    if (action == 'open' && 
            !app.controller.recent.getRecents().size() && 
                !app.controller.recent.getRecovers().size() &&
                    !pinned.length) 
    {
        openFile(OPEN_FILE_FOLDER, '');
    } else {
        if (action === 'about') {
            return CommonEvents.fire('panel:show', [action]);
        }
        $('.tool-menu > .menu-item').removeClass('selected');
        $el.parent().addClass('selected');
        $('.action-panel').hide();
        $('.action-panel.' + action).show(0,()=>{
            // bug: recent panel has the wrong height if 'wellcome' panel is showed firstly
            // if (action == 'recent') {
            //     app.controller.recent.view.updateListSize();
            // }
        });

        CommonEvents.fire('panel:show', [action]);
    }
};

function selectAction(action) {
    if ( !$(`.action-panel.${action}`).length ) return;

    if (action === 'about') {
            return CommonEvents.fire('panel:show', [action]);
    }
    $('.tool-menu > .menu-item').removeClass('selected');
    $('.tool-menu a[action='+action+']').parent().addClass('selected');
    $('.action-panel').hide();
    $('.action-panel.' + action).show();

    CommonEvents.fire('panel:show', [action]);
};

function hideAction(action, hide) {
    if ( action == 'connect' ) {
        hide ? $('#idx-sidebar-portals').hide() :
                $('#idx-sidebar-portals').show();
        return;
    }

    var mitem = $('.tool-menu a[action='+action+']').parent();
    mitem.removeClass('extra')[hide===false?'show':'hide']();
    $('.action-panel.' + action)[hide===false?'show':'hide']();
};

function setLoaderVisible(isvisible, timeout) {
    setTimeout(function(){
        $('#loading-mask')[isvisible?'show':'hide']();
    }, timeout || 200);
}

var OPEN_FILE_RECOVERY = 1;
var OPEN_FILE_RECENT = 2;
var OPEN_FILE_FOLDER = 3;
var Scroll_offset = '16px';

{
    // const mq = "screen and (-webkit-min-device-pixel-ratio: 1.01) and (-webkit-max-device-pixel-ratio: 1.99), " +
    //                             "screen and (min-resolution: 1.01dppx) and (max-resolution: 1.99dppx)";

    // const mql = window.matchMedia(mq);
    // mql.addEventListener('change', e => {
    //     CommonEvents.fire("icons:svg", [!e.target.matches]);
    //     replaceIcons(!e.target.matches);
    // });

    // replaceIcons(!mql.matches);
}

function replaceIcons(usesvg) {
    if ( usesvg ) {
    } else {
        $('.tool-menu svg.icon').each((i, el) => {
            el = $(el);
            const p = el.parent();
            if ( $('i.icon', p).length == 0 ) {
                const icon_pre_class = el.data("precls");
                const icon_class = el.data("iconname");
                const t = `<i class="icon ${icon_pre_class? icon_pre_class : ''} ${icon_class}" />`;
                $(t).insertAfter(el);
            }
        });
    }
}

function onNewFileClick(e) {
    if ($(e.currentTarget).parent().hasClass('disabled'))
        return;
    
    var me = this;
    if (me.click_lock===true) return;
    me.click_lock = true;

    var t;
    switch (e.currentTarget.attributes['action'].value) {
    case 'new:docx': t = 'word'; break;
    case 'new:xlsx': t = 'cell'; break;
    case 'new:pptx': t = 'slide'; break;
    case 'new:form': t = 'form'; break;
    default: break;
    }

    if ( !!t ) window.sdk.command("create:new", t);

    setTimeout(function(){
        me.click_lock = false;
    }, utils.defines.DBLCLICK_LOCK_TIMEOUT);
}

window.sdk.on('on_native_message', function(cmd, param) {
    let _re_res;
    if (cmd == 'portal:logout') {
        // var short_name = utils.skipUrlProtocol(param);
        // var model = portalCollection.find('name', short_name);
        // !!model && model.set('logged', false);
    } else
    if ( (_re_res = /^panel\:(hide|show|select)/.exec(cmd)) ) {
        let panel = param;
        if ( _re_res[1] == 'select' ) {
            selectAction( panel );
        } else {
            let hide = !(_re_res[1] == 'show');

            if ( panel.length ) {
                hideAction(panel, hide);
            }
        }
    } else
    if (/app\:ready/.test(cmd)) {
        setLoaderVisible(false);
    } else
    if (/app\:version/.test(cmd)) {
        $('.tool-menu a[action=about]').parent().removeClass('hidden');
    }
    
    console.log(cmd, param);
});

window.last_click_time = performance.now();
function openFile(from, model) {
    if (window.sdk) {
        if ( performance.now() - last_click_time < 1000 ) return;
        last_click_time = performance.now();

        if (from == OPEN_FILE_FOLDER) {
            window.sdk.command("open:folder", model);
        } else {
            // Every open passes through here -- from the recents list, the recovery
            // list, the context menu or a folder. Recording it here is what lets the
            // search index outlive the core's capped recents list: a file opened once
            // stays findable after it has fallen off the end of that list.
            try {
                RationFileStore.touch({
                    name:   utils.fn.decodeHtml(model.name),
                    path:   utils.fn.decodeHtml(model.path),
                    descr:  model.descr,
                    type:   model.type,
                    format: model.format,
                    fileid: model.fileid,
                    cloud:  model.cloud,
                    date:   model.date
                }, from == OPEN_FILE_RECOVERY ? 'recover' : 'recent');
            } catch (e) { /* opening the file must never depend on the index */ }

            const params = {
                    id: model.fileid,
                    name: utils.fn.decodeHtml(model.name),
                    path: utils.fn.decodeHtml(model.path),
                    type: model.type,
                    cloud: model.cloud,
                    hash: model.hash,
                    recovery: from == OPEN_FILE_RECOVERY,
                };

            // if ( from == OPEN_FILE_RECOVERY ) {
                // window.sdk.LocalFileOpenRecover(parseInt(params.id));       // for bug 60509. change on "open:recovery" event for ver 7.4
                // window.sdk.command("open:recovery", JSON.stringify(params));
            // } else {
                // window.sdk.LocalFileOpenRecent(parseInt(params.id));        // for bug 60509. change on "open:recent" event for ver 7.4
                window.sdk.command("open:recent", JSON.stringify(params));
            // }
        }
    } 
}

document.getElementById('wrap').ondrop = function(e) {
    window.sdk["DropOfficeFiles"]();

    e.preventDefault();
    return false;
}

document.getElementById('wrap').ondragover = function (e) {
    e.dataTransfer.dropEffect = 'copy';

    e.preventDefault();
    return false;
};

$(document).on('keydown', function(e){
    if ( e.ctrlKey && e.which == 79 ) {
        if ($('.action-panel').filter('.recents, .open, .welcome').is(':visible')) {
            openFile(OPEN_FILE_FOLDER, '');
        }
    }
});

window.addEventListener('message', e => {
    let msg = window.JSON.parse(e.data);
    if ( msg.type == 'plugin' ) {
        if ( !!msg.event ) {
            if ( msg.event == 'modal:open' )
                $('.main-column.tool-menu').addClass('view--modal')
            else $('.main-column.tool-menu').removeClass('view--modal');
        } else sdk.fire('on_native_message', Object.values(msg.data));
    }
}, false);
