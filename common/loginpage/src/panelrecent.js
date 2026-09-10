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
*   new inherited controller declaration
*   panel 'recent'
*/

+function () {
    'use strict'
    var ControllerRecent = function (args = {}) {
        args.caption = 'Recent files';
        args.action =
            this.action = "recents";
        this.view = new ViewRecent(args);
    };

    ControllerRecent.prototype = Object.create(baseController.prototype);
    ControllerRecent.prototype.constructor = ControllerRecent;
    const isSvgIcons = window.devicePixelRatio >= 2 || window.devicePixelRatio === 1;
    var ViewRecent = function (args) {
        var _lang = utils.Lang;

        // args.id&&(args.id=`"id=${args.id}"`)||(args.id='');

        // localStorage.removeItem('welcome');


		//language=HTML
        const helpLink = `<a l10n class="link" href="https://helpcenter.onlyoffice.com/" target="popup">${_lang.textHelpCenter}</a>`;
		const welcomeBannerTemplate = !localStorage.getItem('welcome') ? `
            <div id="area-welcome">
                <h2 l10n>${_lang.welWelcome}</h2>
                <p l10n class="text-normal">${_lang.welDescr}</p>
                <p l10n class="text-normal">${_lang.welNeedHelp.replace('$1', helpLink)}</p>
            </div>` : '';

        //language=HTML
        // Ration Docs home page. Structure follows the product design: a fixed
        // topbar carrying search and the account monogram, over a scrolling work
        // area of Create tiles, a Recent/Recover toggle with a type filter, and a
        // single column-aligned file list that both modes share.
        //
        // The list keeps five columns because the app has pin and overflow-menu
        // actions the static mockup omitted; head and rows share one grid track
        // definition so they stay aligned.
        //language=HTML
        args.tplPage = `
            <div class="action-panel ${args.action}">
              <header class="rd-topbar">
                <div class="rd-search" role="search">
                  <div class="rd-search-lead">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
                    </svg>
                  </div>
                  <input type="text" id="idx-recent-filter" autocomplete="off" spellcheck="false"
                         placeholder="${_lang.searchPlaceholder}" aria-label="${_lang.searchPlaceholder}">
                  <div class="rd-kbd" id="idx-search-kbd" aria-hidden="true"></div>
                  <button class="rd-search-go" id="idx-search-go" aria-label="${_lang.searchPlaceholder}">
                    <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>
                    </svg>
                  </button>
                </div>
                <div class="rd-right">
                  <div class="rd-avatar" id="idx-avatar"></div>
                </div>
              </header>

              <div class="rd-work">
                <h1 class="rd-sec-h" l10n>${_lang.searchCreate}</h1>
                <section id="area-document-creation-grid"></section>
                ${welcomeBannerTemplate}
                <section id="area-dnd-file"></section>

                <div class="rd-rf-head">
                  <div class="rd-toggle" id="idx-list-toggle" role="tablist">
                    <button type="button" class="on" data-m="recent" role="tab" l10n>${_lang.listRecentFileTitle}</button>
                    <button type="button" data-m="recover" role="tab" l10n>${_lang.listRecoveryTitle}</button>
                  </div>
                  <span class="rd-count" id="idx-recent-count"></span>
                  <div class="rd-seg" id="idx-type-seg">
                    <button type="button" class="on" data-t="all" l10n>${_lang.segAll}</button>
                    <button type="button" data-t="docx" l10n>${_lang.segDocs}</button>
                    <button type="button" data-t="xlsx" l10n>${_lang.segSheets}</button>
                    <button type="button" data-t="pptx" l10n>${_lang.segSlides}</button>
                    <button type="button" data-t="pdf" l10n>${_lang.segPdf}</button>
                  </div>
                </div>

                <div id="box-container">
                  <div id="box-recent" class="rd-list">
                    <div class="file-list-head text-normal">
                      <div class="col-name" l10n>${_lang.colFileName}</div>
                      <div class="col-location" l10n>${_lang.colLocation}</div>
                      <div class="col-date" l10n>${_lang.colLastOpened}</div>
                    </div>
                    <div class="file-list-body scrollable"></div>
                    <div id="idx-history-block" style="display: none;">
                      <div class="file-list-subhead text-normal">
                        <span l10n>${_lang.searchFromHistory}</span>
                      </div>
                      <div id="idx-history-body" class="file-list-body"></div>
                    </div>
                    <div id="idx-recent-no-results" class="rd-empty" style="display: none;">
                      <b class="no-results-title" id="idx-recent-no-results-title"></b>
                      <span class="no-results-text" l10n>${_lang.searchNoResultsHint}</span>
                      <button class="rd-empty-btn" id="idx-clear-search" l10n>${_lang.searchClear}</button>
                    </div>
                  </div>

                  <div id="box-recovery" class="rd-list recover" style="display: none;">
                    <div class="file-list-head text-normal">
                      <div class="col-name" l10n>${_lang.colFileName}</div>
                      <div class="col-location" l10n>${_lang.colStatus}</div>
                      <div class="col-date" l10n>${_lang.colAutosaved}</div>
                    </div>
                    <div class="file-list-body scrollable"></div>
                    <div id="idx-recover-empty" class="rd-empty" style="display: none;">
                      <b l10n>${_lang.recoverNothingTitle}</b>
                      <span l10n>${_lang.recoverNothingHint}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        args.menu = '.main-column.tool-menu';
        args.field = '.main-column.col-center';
        args.itemindex = 0;
        // args.itemtext = _lang.actRecentFiles;
        args.tplItem = 'nomenuitem';

        baseView.prototype.constructor.call(this, args);
    };

    ViewRecent.prototype = Object.create(baseView.prototype);
    ViewRecent.prototype.constructor = ViewRecent;
    utils.fn.extend(ViewRecent.prototype, {
        render: function () {
            baseView.prototype.render.apply(this, arguments);

            if (!localStorage.getItem('welcome')) {
                localStorage.setItem('welcome', '0');
            }

            this.$boxRecovery = this.$panel.find('#box-recovery');
            this.$boxRecent = this.$panel.find('#box-recent');
            this.$panelContainer = this.$panel.find('.rd-work');
        },
        listitemtemplate: function (info) {
            let id = !!info.uid ? (` id="${info.uid}"`) : '';
            info.crypted === undefined && (info.crypted = false);
            const dotIndex = info.name.lastIndexOf('.');
            const fullName = info.name;
            if (dotIndex !== -1) {
                info.ext = info.name.substring(dotIndex);
                info.name = info.name.substring(0, dotIndex);
            } else {
                info.ext = '';
            }

            // todo: crypted icon

            //language=HTML
            let _tpl = `
                <div ${id} class="row text-normal">
                    <div class="col-name" title="${fullName}">
                        <div class="icon">
                            <svg class="icon" data-iconname="${info.type === 'folder' ? 'folder' : `${info.format}`}"
                                 data-precls="tool-icon">
                                <use xlink:href="#${info.type === 'folder' ? 'folder-small' : info.format}"></use>
                            </svg>
                            ${info.crypted ? `<svg class="icon shield" data-iconname="shield" data-precls="tool-icon">
                                                <use xlink:href="#shield"></use>
                                              </svg>` : ''}
                            ${!isSvgIcons ? `<i class="icon ${info.type === 'folder' ? 'img-el folder' : `img-format ${info.format}`}"></i>` : ''}
                            ${info.crypted && !isSvgIcons ? `<i class="icon img-el shield"></i>` : ''}
                        </div>
                        <p class="name">
                            ${info.name}<span class="ext">${info.ext}</span>
                        </p>
                    </div>
                    <div class="col-location" title="${info.descr}">
                        <!--              todo: icon here          -->
                        ${info.descr}
                    </div>
            `;

            //language=HTML
            _tpl += `
                <div class="col-pin">
                    <button id="${info.uid}-pin-btn" class="btn-quick">
                        <svg class="icon">
                            <use xlink:href="#pin"/>
                        </svg>
                        ${!isSvgIcons ? '<i class="icon tool-icon pin"></i>' : ''}
                    </button>
                </div>`;

            if (info.type !== 'folder') {
                //language=HTML
                _tpl += `
                    <div class="col-date"><p>${info.date}</p></div>`;

                //language=HTML
                _tpl += `
                    <div class="col-more">
                        <button id="${info.uid}-more-btn" class="btn-quick more">
                            <svg class="icon">
                                <use xlink:href="#more"/>
                            </svg>
                            ${!isSvgIcons ? '<i class="icon tool-icon more"></i>' : ''}
                        </button>
                    </div>`;
            }

            return _tpl + '</div>';
        },
        onscale: function (pasteSvg) {
            let elm, icoName, parent,
                emptylist = $('[class*="text-emptylist"]', '#box-recent');
            emptylist.toggleClass('text-emptylist text-emptylist-svg');

            if (pasteSvg && !emptylist.find('svg').length)
                emptylist.prepend($('<svg class = "icon"><use xlink:href="#folder-big"></use></svg>'));

            // todo: rewrite cicon rescale

            $('#box-recent .row.text-normal').each(function () {
                let elm = $(this);
                let iconContainer = elm.find('.col-name .icon').first();
                let svgElem = iconContainer.find('svg.icon').first();

                if (pasteSvg || !svgElem.length || iconContainer.find('i.icon').length) return;

                let icoName = svgElem.attr('data-iconname');
                iconContainer.append(`<i class="icon img-format ${icoName}"></i>`);

                if (iconContainer.find('.icon.shield').length) {
                    iconContainer.append(`<i class="icon img-el shield"></i>`);
                }
            });

            $('.open-panel-container .row.text-normal').each(function () {
                let elm = $(this);
                let iconContainer = elm.find('.col-name .icon').first();
                let svgElem = iconContainer.find('svg.icon').first();

                if (pasteSvg || !svgElem.length || iconContainer.find('i.icon').length) return;

                iconContainer.append(`<i class="icon img-el folder"></i>`);

                if (iconContainer.find('.icon.shield').length) {
                    iconContainer.append(`<i class="icon img-el shield"></i>`);
                }
            });

            $('.col-more .btn-quick.more').each(function () {
                let btn = $(this);
                let svgElem = btn.find('svg.icon').first();

                if (pasteSvg || !svgElem.length || btn.find('i.icon').length) return;

                btn.append(`<i class="icon tool-icon more"></i>`);
            });
        },
        updateListSize: function () {
            const windowBottom = $(window).height();

            // Recovery
            const $headRecovery = this.$boxRecovery.find('.file-list-head');
            const $bodyRecovery = this.$boxRecovery.find('.file-list-body');

            if ($headRecovery.length && $bodyRecovery.length) {
                const headBottomRecovery = $headRecovery.offset().top + $headRecovery.outerHeight(true);
                const availableRecovery = windowBottom - headBottomRecovery - 20;

                $bodyRecovery.css({ 'max-height': availableRecovery > 0 ? availableRecovery + 'px' : '0px' });
            }

            // Recent
            const $headRecent = this.$boxRecent.find('.file-list-head');
            const $bodyRecent = this.$boxRecent.find('.file-list-body');

            if ($headRecent.length && $bodyRecent.length) {
                const headBottomRecent = $headRecent.offset().top + $headRecent.outerHeight(true);
                const availableRecent = windowBottom - headBottomRecent - 20;

                $bodyRecent.css({ 'max-height': availableRecent > 0 ? availableRecent + 'px' : '0px' });
            }
        },
    });

    window.ControllerRecent = ControllerRecent;

    String.prototype.hashCode = function () {
        var hash = 0, i, chr;
        if (this.length === 0) return hash;

        for (i = this.length; !(--i < 0);) {
            chr = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash = hash & hash; // Convert to 32bit integer
        }

        return hash;
    };

    utils.fn.extend(ControllerRecent.prototype, (function () {
        let collectionRecents, collectionRecovers;
        let ppmenu;
        const ITEMS_LOAD_RANGE = 40;

        const _add_recent_block = function () {
            if (!this.rawRecents || !Object.keys(this.rawRecents).length) return;

            const _raw_block = this.rawRecents.slice(this.recentIndex, this.recentIndex + ITEMS_LOAD_RANGE);
            const _files = utils.fn.parseRecent(_raw_block);

            let _check_block = {};

            for (let item of _files) {
                var model = new FileModel(item);
                model.set('hash', item.path.hashCode());

                if (!!this.rawRecents) {
                    collectionRecents.add(model);
                    _check_block[model.get('hash')] = item.path;
                } else return;
            }

            const _new_items_count = Object.keys(_check_block).length;
            if (_new_items_count) {
                if (this.appready) {
                    sdk.execCommand('files:check', JSON.stringify(_check_block));
                }

                Object.assign(this.check_list, _check_block);
            }

            if (_new_items_count === ITEMS_LOAD_RANGE) {
                setTimeout(e => {
                    this.recentIndex += ITEMS_LOAD_RANGE;
                    _add_recent_block.call(this);
                }, 10);
            } else {
                this.rawRecents = undefined;
            }

            // this.view.$boxRecent.css('display', collectionRecents.size() > 0 ? 'flex' : 'none');

            if (collectionRecents.size() > 0 || collectionRecovers.size() > 0) {
                this.dndZone.hide();
                this.view.$panel.find('#area-welcome').hide();
            }
        };

        var _on_recents = function (params) {
            this.rawRecents = undefined;

            // Index the pushed list. The core caps how many recents it keeps, so
            // this is a snapshot, not the whole history -- openFile() adds the rest.
            try {
                RationFileStore.upsertMany(utils.fn.parseRecent(params), 'recent')
                    .then(function () { RationFileStore.prune(); });
            } catch (e) { /* search simply falls back to the in-memory lists */ }

            setTimeout(e => {
                this.rawRecents = params;
                this.recentIndex = 0;

                collectionRecents.empty();
                _add_recent_block.call(this);
            }, 10)
        };

        var _on_recovers = function(params) {
            if ( false )
                window.sdk.command("recovery:update", JSON.stringify(params));
            else {
                collectionRecovers.empty();

                var files = utils.fn.parseRecent(params);
                for (let item of files) {
                    collectionRecovers.add( new FileModel(item) );
                }

                try { RationFileStore.upsertMany(files, 'recover'); } catch (e) {}

                // Visibility belongs to the Recent/Recover toggle, so this only
                // refreshes counts; it must not force the recover list on screen.
                _reapply_filter.call(this);
                // requestAnimationFrame(() => this.view.updateListSize());

                if (collectionRecents.size() > 0 || collectionRecovers.size() > 0) {
                    this.dndZone.hide();
                }
            }
        };

        function addContextMenuEventListener(collection, model, view, actionList) {
            $(`#${model.uid}-pin-btn`, view).click((e) => {
                e.stopPropagation();
                const pinned = !model.pinned;
                model.setMany({ pinned: pinned, pinid: pinned ? -model.fileid : model.fileid });
            })

            $(`#${model.uid}-more-btn`, view).click((e) => {
                e.stopPropagation();

                if (ppmenu.contextdata) {
                    const m = ppmenu.contextdata;
                    if (m.uid != model.uid)
                        Menu.closeAll();
                }
                ppmenu.actionlist = actionList;
                if (actionList === 'recovery') {
                    ppmenu.hideItem('files:explore', true);
                    ppmenu.hideItem('files:pin', true);
                    ppmenu.hideItem('files:unpin', true);
                } else {
                    ppmenu.hideItem('files:explore', (!model.islocal && !model.dir) || !model.exist);
                    ppmenu.hideItem(model.pinned ? 'files:pin' : 'files:unpin', true);
                    ppmenu.hideItem(model.pinned ? 'files:unpin' : 'files:pin', false);
                }

                if (!Menu.opened) {
                    ppmenu.showUnderElem(e.currentTarget, model, $('body').hasClass('rtl') ? 'left' : 'right');
                } else {
                    Menu.closeAll();
                }
            })
        }

        function handlePin(collection, model) {
            let $el = $('#' + model.uid, collection.list);
            if (!$el.length) return;

            $el.detach();

            if (model.pinid <= 0) {
                // Pinning: insert after last pinned, or prepend
                const $lastPinned = collection.list.children('.row.pinned').last();
                $lastPinned.length ? $el.insertAfter($lastPinned) : $el.prependTo(collection.list);
                return;
            }

            // Unpinning: restore position among unpinned items
            const modelIndex = collection.items.indexOf(model);
            const items = collection.items;

            // Find nearest unpinned neighbor in DOM to position relative to
            for (let i = modelIndex + 1; i < items.length; i++) {
                if (!items[i].pinned) {
                    let $target = $('#' + items[i].uid, collection.list);
                    if ($target.length) { $el.insertBefore($target); return; }
                }
            }

            for (let i = modelIndex - 1; i >= 0; i--) {
                if (!items[i].pinned) {
                    let $target = $('#' + items[i].uid, collection.list);
                    if ($target.length) { $el.insertAfter($target); return; }
                }
            }

            // No unpinned neighbors found — place after pinned block or at start
            const $lastPinned = collection.list.children('.row.pinned').last();
            $lastPinned.length ? $el.insertAfter($lastPinned) : $el.prependTo(collection.list);
        }

        function _init_collections() {
            let _cl_rcbox = this.view.$boxRecent,
                _cl_rvbox = this.view.$boxRecovery;

            collectionRecents = new Collection({
                view: _cl_rcbox,
                list: _cl_rcbox.find('.file-list-body')
            });

            collectionRecents.events.erased.attach(collection => {
                collection.list.parent().addClass('empty');
            });

            collectionRecents.events.inserted.attach((collection, model) => {
                let $item = $(this.view.listitemtemplate(model));

                if (model.pinned) {
                    const $pinned = collection.list.children('.row.pinned');
                    if ($pinned.length) {
                        $item.insertAfter($pinned.last());
                    } else {
                        $item.prependTo(collection.list);
                    }
                } else {
                    collection.list.append($item);
                }

                $item[model.pinned ? 'addClass' : 'removeClass']('pinned');

                addContextMenuEventListener(collection, model, this.view.$panel, 'recent');

                collection.list.parent().removeClass('empty');
            });

            collectionRecents.events.click.attach((collection, model) => {
                // var _portal = model.descr;
                // if ( !model.islocal && !app.controller.portals.isConnected(_portal) ) {
                // app.controller.portals.authorizeOn(_portal, {type: 'fileid', id: model.fileid});
                // } else {
                openFile(OPEN_FILE_RECENT, model);
                // }
            });

            collectionRecents.events.contextmenu.attach(function (collection, model, e) {
                ppmenu.actionlist = 'recent';
                ppmenu.hideItem('files:explore', (!model.islocal && !model.dir) || !model.exist);
                ppmenu.hideItem(model.pinned ? 'files:pin' : 'files:unpin', true);
                ppmenu.hideItem(model.pinned ? 'files:unpin' : 'files:pin', false);
                ppmenu.show({left: e.clientX, top: e.clientY}, model);
            });

            collectionRecents.events.changed.attach(function (collection, model, property) {
                let $el = collection.list.find('#' + model.uid);
                if ($el) {
                    $el[model.exist ? 'removeClass' : 'addClass']('unavail');
                    if (property['pinned'] !== undefined) {
                        sdk.setRecentFilePinned(model.get('fileid'), property['pinned']);
                        $el[model.pinned ? 'addClass' : 'removeClass']('pinned');
                    }

                    if (property.pinid != undefined) {
                        handlePin(collection, model);
                    }
                }
            });

            collectionRecents.empty();

            /**/

            collectionRecovers = new Collection({
                view: _cl_rvbox,
                list: _cl_rvbox.find('.file-list-body')
            });
            collectionRecovers.events.inserted.attach((collection, model) => {
                collection.list.append(this.view.listitemtemplate(model));
                addContextMenuEventListener(collection, model, this.view.$panel, 'recovery');
            });
            collectionRecovers.events.click.attach((collection, model) => {
                openFile(OPEN_FILE_RECOVERY, model);
            });
            collectionRecovers.events.contextmenu.attach((collection, model, e) => {
                ppmenu.actionlist = 'recovery';
                ppmenu.hideItem('files:explore', true);
                ppmenu.hideItem('files:pin', true);
                ppmenu.hideItem('files:unpin', true);
                ppmenu.show({left: e.clientX, top: e.clientY}, model);
            });
        };

        function _init_ppmenu() {
            if (ppmenu) {
                Menu.closeAll();
                $('#pp-menu-files').remove();
                ppmenu = null;
            }

            ppmenu = new Menu({
                id: 'pp-menu-files',
                className: 'with-icons',
                bottomlimitoffset: 10,
                items: [
                    {caption: utils.Lang.menuFileOpen, action: 'files:open', icon: '#folder'},
                    {caption: utils.Lang.menuFilePin, action: 'files:pin', icon: '#pin20'},
                    {caption: utils.Lang.menuFileUnpin, action: 'files:unpin', icon: '#unpin20'},
                    {caption: utils.Lang.menuFileExplore, action: 'files:explore', icon: '#gofolder'},
                    {caption: utils.Lang.menuRemoveModel, action: 'files:forget', icon: '#remove'},
                    {caption: '--'},
                    {caption: utils.Lang.menuClear, action: 'files:clear', variant: 'negative'}
                ]
            });

            ppmenu.init('#placeholder');
            ppmenu.events.itemclick.attach(_on_context_menu.bind(this));
        };

        function _on_context_menu(menu, action, data) {
            if (/\:open/.test(action)) {
                menu.actionlist == 'recent' ?
                    openFile(OPEN_FILE_RECENT, data) :
                    openFile(OPEN_FILE_RECOVERY, data);
            } else if (/\:pin/.test(action)) {
                const targetModel = collectionRecents.find('uid', data.uid);
                if (targetModel) {
                    targetModel.setMany({ pinned: true, pinid: -targetModel.fileid });
                }
            } else if (/\:unpin/.test(action)) {
                const targetModel = collectionRecents.find('uid', data.uid);
                if (targetModel) {
                    targetModel.setMany({ pinned: false, pinid: targetModel.fileid });
                }
            } else if (/\:clear/.test(action)) {
                if (menu.actionlist === 'recent') {
                    window.sdk.LocalFileRemoveAllRecents();
                    if (collectionRecovers.size() === 0) {
                        this.dndZone.show();
                    }
                } else {
                    window.sdk.LocalFileRemoveAllRecovers();
                    if (collectionRecents.size() === 0) {
                        this.dndZone.show();
                    }
                }
            } else if (/\:forget/.test(action)) {
                $('#' + data.uid, this.view.$panel).addClass('lost');

                const count = collectionRecovers.size() + collectionRecents.size();
                if (menu.actionlist === 'recent') {
                    window.sdk.LocalFileRemoveRecent(parseInt(data.fileid));
                } else {
                    window.sdk.LocalFileRemoveRecover(parseInt(data.fileid));
                }

                if ( !(count > 1) ) {
                    this.dndZone.show();
                }
            } else if (/\:explore/.test(action)) {
                if (menu.actionlist == 'recent') {
                    sdk.execCommand('files:explore', JSON.stringify({
                        path: data.path,
                        id: data.fileid,
                        hash: data.hash
                    }));
                }
            }
        };

        // note: search function
        //
        // Matching is deliberately literal. The previous implementation compiled the
        // raw query with `new RegExp(value, "gi")`, so a query containing "(", "[" or
        // "*" threw SyntaxError, and it reused one /g/ regex across every model --
        // RegExp.prototype.test advances lastIndex on a match, so alternate items
        // were skipped. Both bugs are avoided by folding to plain strings and using
        // indexOf.

        const _fold = utils.fn.fold;
        const _foldIndexed = utils.fn.foldIndexed;

        function _debounce(fn, wait) {
            let timer = null;
            return function () {
                const ctx = this, args = arguments;
                timer && clearTimeout(timer);
                timer = setTimeout(function () { timer = null; fn.apply(ctx, args); }, wait);
            };
        }

        let _activeFilter = '';
        let _activeMode = 'recent';   // which list the toggle is showing
        let _activeType = 'all';      // which segment of the type filter is on

        // The segments are document *kinds*, not single extensions: picking
        // "Documents" must keep .odt and .rtf, which the user thinks of as
        // documents even though the format id differs.
        const _typeGroups = {
            docx: ['docx', 'doc', 'odt', 'rtf', 'txt', 'docm', 'dotx', 'fodt', 'ott', 'docxf', 'oform'],
            xlsx: ['xlsx', 'xls', 'ods', 'csv', 'xlsm', 'xltx', 'fods', 'ots'],
            pptx: ['pptx', 'ppt', 'odp', 'ppsx', 'pptm', 'potx', 'fodp', 'otp'],
            pdf:  ['pdf', 'djvu', 'xps', 'oxps']
        };

        // Prefer the model's own format id, and fall back to the extension so a
        // history row that never went through the core still classifies.
        function _type_of(model) {
            let fmt = (model.get ? model.get('format') : model.format) || '';
            if (!fmt) {
                const name = (model.get ? model.get('name') : model.name) || '';
                const dot = name.lastIndexOf('.');
                if (dot !== -1) fmt = name.substring(dot + 1);
            }
            return String(fmt).toLowerCase();
        }

        function _type_matches(model) {
            if (_activeType === 'all') return true;
            const group = _typeGroups[_activeType];
            return !!group && group.indexOf(_type_of(model)) !== -1;
        }

        // Every whitespace-separated term must match, so "report 2025" narrows rather
        // than widening -- order-independent, unlike a single substring match.
        function _terms(value) {
            return _fold(value).split(/\s+/).filter(Boolean);
        }

        function _model_matches(model, terms) {
            const haystack = _fold(model.get('name')) + ' ' +
                             _fold(model.get('descr')) + ' ' +
                             _fold(model.get('path'));
            return terms.every(term => haystack.indexOf(term) !== -1);
        }

        // Wrap matches in <mark> inside an element's own text nodes, leaving child
        // elements (the file-extension span) intact.
        function _mark(el, terms) {
            if (!el) return;
            _unmark(el);
            if (!terms.length) return;
            const nodes = [];
            for (let n = el.firstChild; n; n = n.nextSibling) {
                if (n.nodeType === 3 && n.nodeValue) nodes.push(n);
            }
            nodes.forEach(function (node) {
                const src = node.nodeValue;
                const folded = _foldIndexed(src);
                let ranges = [];
                terms.forEach(function (t) {
                    let i = folded.text.indexOf(t);
                    while (i !== -1) {
                        ranges.push([folded.map[i], folded.map[i + t.length]]);
                        i = folded.text.indexOf(t, i + t.length);
                    }
                });
                if (!ranges.length) return;
                ranges.sort((a, b) => a[0] - b[0]);
                const merged = [];
                ranges.forEach(function (r) {
                    const last = merged[merged.length - 1];
                    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
                    else merged.push([r[0], r[1]]);
                });
                const frag = document.createDocumentFragment();
                let at = 0;
                merged.forEach(function (r) {
                    if (r[0] > at) frag.appendChild(document.createTextNode(src.slice(at, r[0])));
                    const m = document.createElement('mark');
                    m.className = 'search-hit';
                    m.textContent = src.slice(r[0], r[1]);
                    frag.appendChild(m);
                    at = r[1];
                });
                if (at < src.length) frag.appendChild(document.createTextNode(src.slice(at)));
                el.replaceChild(frag, node);
            });
        }

        function _unmark(el) {
            if (!el) return;
            const marks = el.querySelectorAll ? el.querySelectorAll('mark.search-hit') : [];
            for (let i = 0; i < marks.length; i++) {
                const m = marks[i];
                m.parentNode.replaceChild(document.createTextNode(m.textContent), m);
            }
            el.normalize && el.normalize();
        }

        function _filter_collection(collection, $panel, terms) {
            let matched = 0;
            collection.items.forEach(function (model) {
                const hidden = !_type_matches(model) ||
                               (terms.length > 0 && !_model_matches(model, terms));
                if (!hidden) matched++;
                if (model.get('hidden') !== hidden) model.set('hidden', hidden);
                const $row = $('#' + model.uid, $panel);
                $row.toggleClass('hidden', hidden);
                if (hidden) {
                    _unmark($row.find('.col-name .name')[0]);
                    _unmark($row.find('.col-location')[0]);
                } else {
                    _mark($row.find('.col-name .name')[0], terms);
                    _mark($row.find('.col-location')[0], terms);
                }
            });
            return matched;
        }

        // Rows already on screen, keyed the same way the store keys entries, so a
        // history hit that is already visible is not shown twice.
        function _visible_keys() {
            const keys = {};
            collectionRecents.items.concat(collectionRecovers.items).forEach(function (m) {
                const p = m.get('path') || m.get('name');
                if (p) keys[String(p).toLowerCase()] = true;
            });
            return keys;
        }

        // Async results are raced: a slow query for "rep" must not overwrite the
        // rendered results of the later "report". Only the newest token may paint.
        let _searchToken = 0;

        function _render_history(rows, terms) {
            const $panel = this.view.$panel;
            const $block = $('#idx-history-block', $panel);
            const $body = $('#idx-history-body', $panel);
            $body.empty();
            if (!rows.length) { $block.hide(); return 0; }

            const view = this.view;
            rows.forEach(function (row) {
                const info = {
                    uid: 'hist-' + utils.fn.uuid(),
                    name: row.name,
                    descr: row.descr,
                    date: row.date || '',
                    type: row.type,
                    format: row.format,
                    crypted: false
                };
                const $row = $(view.listitemtemplate(info));
                $row.addClass('history-item');
                $row.on('click', function () {
                    openFile(OPEN_FILE_RECENT, {
                        fileid: row.fileid, name: row.name, path: row.path,
                        type: row.type, cloud: row.cloud, hash: row.hash
                    });
                });
                $body.append($row);
                _mark($row.find('.col-name .name')[0], terms);
                _mark($row.find('.col-location')[0], terms);
            });
            $block.show();
            return rows.length;
        }

        function _apply_filter(value) {
            const $panel = this.view.$panel;
            const self = this;
            _activeFilter = value || '';
            const terms = _terms(_activeFilter);
            const searching = terms.length > 0;

            const matchedRecent  = _filter_collection(collectionRecents, $panel, terms);
            const matchedRecover = _filter_collection(collectionRecovers, $panel, terms);
            const matched = _activeMode === 'recover' ? matchedRecover : matchedRecent;

            const token = ++_searchToken;

            function paint(historyCount) {
                const total = matched + historyCount;

                // The design shows the count at all times, not only while searching.
                $('#idx-recent-count', $panel).text(
                    (total === 1 ? utils.Lang.searchCountOne : utils.Lang.searchCountMany)
                        .replace('$1', total)
                );

                if (_activeMode === 'recover') {
                    $('#idx-recent-no-results', $panel).hide();
                    $('#idx-recover-empty', $panel).toggle(total === 0);
                    $('#box-recovery .file-list-head', $panel).toggle(total !== 0);
                    return;
                }

                // With no query and no rows the drag-and-drop zone already explains
                // the empty page, so the search-specific block stays hidden.
                const empty = searching && total === 0;
                $('#idx-recover-empty', $panel).hide();
                $('#idx-recent-no-results-title', $panel)
                    .text(utils.Lang.searchNoResults.replace('$1', _activeFilter));
                $('#idx-recent-no-results', $panel).toggle(empty);
                $('#box-recent .file-list-head', $panel).toggle(!empty && matched > 0);
            }

            // History is a recent-files concept; the recover list is whatever the
            // core currently holds, so there is nothing older to fold in.
            if (!searching || _activeMode === 'recover') {
                _render_history.call(self, [], terms);
                paint(0);
                return;
            }

            // Paint what is already on screen first so typing stays responsive, then
            // fold in the store results when they arrive.
            paint(0);

            let query;
            try { query = RationFileStore.search(terms, 50); }
            catch (e) { query = Promise.resolve([]); }

            query.then(function (rows) {
                if (token !== _searchToken) return;      // a newer query has started
                const seen = _visible_keys();
                const extra = rows.filter(function (r) {
                    return !seen[r.key] && _type_matches(r);
                });
                paint(_render_history.call(self, extra, terms));
            }).catch(function () {
                if (token === _searchToken) paint(0);
            });
        }

        // Show one list at a time and re-run the filter so the count, empty state
        // and history block all describe the list the user is now looking at.
        function _set_mode(mode) {
            _activeMode = mode === 'recover' ? 'recover' : 'recent';
            const $panel = this.view.$panel;
            $('#idx-list-toggle button', $panel).each(function () {
                $(this).toggleClass('on', this.getAttribute('data-m') === _activeMode);
            });
            this.view.$boxRecent.css('display', _activeMode === 'recent' ? 'flex' : 'none');
            this.view.$boxRecovery.css('display', _activeMode === 'recover' ? 'flex' : 'none');
            _apply_filter.call(this, _activeFilter);
        }

        function _set_type(type) {
            _activeType = type || 'all';
            const $panel = this.view.$panel;
            $('#idx-type-seg button', $panel).each(function () {
                $(this).toggleClass('on', this.getAttribute('data-t') === _activeType);
            });
            _apply_filter.call(this, _activeFilter);
        }

        function _reapply_filter() {
            _apply_filter.call(this, _activeFilter);
        }

        return {
            init: function () {
                baseController.prototype.init.apply(this, arguments);

                this.view.render();
                this.check_list = {};

                _init_collections.call(this);
                _init_ppmenu.call(this);

                window.sdk.on('onupdaterecents', function () {
                    _on_recents.apply(this, arguments);
                    // rows added after a query was typed must honour it too
                    _reapply_filter.call(this);
                }.bind(this));
                window.sdk.on('onupdaterecovers', _on_recovers.bind(this));
                window.sdk.on('on_native_message', (cmd, param) => {
                    if (/files:checked/.test(cmd)) {
                        let fobjs = JSON.parse(param);
                        if (fobjs) {
                            for (let obj in fobjs) {
                                let value = JSON.parse(fobjs[obj]);
                                let model = collectionRecents.find('hash', parseInt(obj));
                                if (model) {
                                    model.get('exist') != value && model.set('exist', value);
                                }
                            }
                        }
                    } else if (/file\:skip/.test(cmd)) {
                        sdk.LocalFileRemoveRecent(parseInt(param));
                    } else if (/app\:ready/.test(cmd)) {
                        if (Object.keys(this.check_list).length) {
                            setTimeout(() => {
                                sdk.execCommand('files:check', JSON.stringify(this.check_list));
                            }, 100);
                        }

                        this.appready = true;
                    }
                });

                CommonEvents.on("icons:svg", this.view.onscale);
                CommonEvents.on('portal:authorized', (data) => {
                    if (data.type == 'fileid') {
                        let fileid = data.id;
                        // openFile(OPEN_FILE_RECENT, fileid);
                    }

                    console.log('portal authorized');
                });


                this.dndZone = new DnDFileZone();
                this.dndZone.render(this.view.$panel.find("#area-dnd-file"));

                const docGrid = new DocumentCreationGrid({
                    documentTypes: [
                        {
                            id: 'word',
                            title: utils.Lang.newDoc,
                            langKey: 'newDoc',
                            icon: '#docx-big',
                            chip: 'DOCX',
                            meta: utils.Lang.metaBlankDoc,
                        },
                        {
                            id: 'cell',
                            title: utils.Lang.newXlsx,
                            langKey: 'newXlsx',
                            icon: '#xlsx-big',
                            chip: 'XLSX',
                            meta: utils.Lang.metaBlankSheet,
                        },
                        {
                            id: 'slide',
                            title: utils.Lang.newPptx,
                            langKey: 'newPptx',
                            icon: '#pptx-big',
                            chip: 'PPTX',
                            meta: utils.Lang.metaBlankSlides,
                        },
                        {
                            id: 'form',
                            title: utils.Lang.newForm,
                            langKey: 'newForm',
                            icon: '#pdf-big',
                            chip: 'PDF',
                            meta: utils.Lang.metaBlankPdf,
                        }
                    ],
                    onDocumentSelect: (docType) => {
                        window.sdk.command("create:new", docType);
                    }
                });

                CommonEvents.on('lang:changed', _init_ppmenu.bind(this));

                docGrid.render(this.view.$panel.find("#area-document-creation-grid"));

                const $filter = $('#idx-recent-filter, #ration-recent-filter', this.view.$panel);

                // The design shows a Cmd-K hint; Cmd is only correct on macOS.
                const _isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '');
                $('#idx-search-kbd', this.view.$panel)
                    .html(_isMac ? '<span>⌘</span><span>K</span>'
                                 : '<span>Ctrl</span><span>K</span>');

                // 120ms: below the ~150ms that reads as lag, high enough that a fast
                // typist filters the collection once per word rather than per keystroke.
                $filter.on('input', _debounce(function (e) {
                    _apply_filter.call(this, e.target.value);
                }.bind(this), 120));

                $filter.on('keydown', function (e) {
                    if (e.key === 'Escape' || e.keyCode === 27) {
                        $filter.val('');
                        _apply_filter.call(this, '');
                        $filter.blur();
                    }
                }.bind(this));

                // Cmd/Ctrl-K focuses and selects, matching the hint shown in the field.
                $(document).on('keydown.recentsearch', function (e) {
                    const key = (e.key || '').toLowerCase();
                    if ((e.metaKey || e.ctrlKey) && key === 'k') {
                        e.preventDefault();
                        $filter.focus().select();
                    }
                });

                $('#idx-search-go', this.view.$panel).on('click', function () {
                    $filter.focus().select();
                });

                $('#idx-list-toggle', this.view.$panel).on('click', 'button', function (e) {
                    _set_mode.call(this, e.currentTarget.getAttribute('data-m'));
                }.bind(this));

                $('#idx-type-seg', this.view.$panel).on('click', 'button', function (e) {
                    _set_type.call(this, e.currentTarget.getAttribute('data-t'));
                }.bind(this));

                // Initials come from the signed-in cloud account when there is one.
                // With no account there is no person to name, so the tile falls back
                // to the product monogram rather than inventing a user.
                (function ($avatar) {
                    let name = '';
                    try {
                        const u = (window.AscDesktopEditor && window.AscDesktopEditor.currentUserName) ||
                                  (window.app && window.app.currentUser && window.app.currentUser.name) || '';
                        name = String(u || '').trim();
                    } catch (e) { name = ''; }

                    if (name) {
                        const parts = name.split(/\s+/).filter(Boolean);
                        const initials = (parts.length > 1
                            ? parts[0][0] + parts[parts.length - 1][0]
                            : parts[0].substring(0, 2)).toUpperCase();
                        $avatar.text(initials).attr('title', name);
                    } else {
                        $avatar.text('RD').attr('title', 'Ration Docs');
                    }
                })($('#idx-avatar', this.view.$panel));

                // Paint the initial count and empty state before any interaction.
                _set_mode.call(this, 'recent');

                $('#idx-clear-search', this.view.$panel).on('click', function () {
                    $filter.val('').focus();
                    _apply_filter.call(this, '');
                }.bind(this));

                CommonEvents.on('lang:changed', function () {
                    $filter.attr('placeholder', utils.Lang.searchPlaceholder);
                    $('#idx-clear-search', this.view.$panel).text(utils.Lang.searchClear);
                    $('#idx-recent-no-results .no-results-text', this.view.$panel)
                        .text(utils.Lang.searchNoResultsHint);
                    _reapply_filter.call(this);
                }.bind(this));

                return this;
            },
            getRecents: function () {
                return collectionRecents;
            },
            getRecovers: function () {
                return collectionRecovers;
            }
        };
    })());
}();

/*
*   controller definition
*/

// window.CommonEvents.on('main:ready', function(){
//     var p = new ControllerRecent({});
//     p.init();
// });
