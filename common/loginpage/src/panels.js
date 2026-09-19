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
              <!-- The wordmark is embedded rather than linked. This markup is a
                   JavaScript string, so the build's HTML inliner never sees the
                   reference; a relative path would resolve against the packaged
                   index.html at the bundle root, where res/img does not exist.
                   Source artwork: common/loginpage/res/img/ration-wordmark.png -->
              <div class="ration-brand" aria-label="Ration Docs">
                <img class="ration-wordmark" alt="Ration Docs" src="data:image/png;base64,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">
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
