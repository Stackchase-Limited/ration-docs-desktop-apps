/*
 * File history store for the Ration Docs start page.
 *
 * The desktop core keeps a short, capped list of recent files and hands it to
 * the start page on every refresh. That list is all the previous search could
 * see, so a file dropped off the end of it became unfindable even though the
 * user had opened it a fortnight ago.
 *
 * This module keeps a longer-lived index in IndexedDB. Entries arrive from two
 * places: the recents/recovery lists the core pushes, and the moment a file is
 * actually opened -- the latter matters because a file opened from a folder, a
 * drop or the context menu never appears in a pushed list until the core next
 * refreshes it.
 *
 * Nothing here is authoritative. The store is a search index over filenames the
 * user has already seen on this machine; if it is unavailable or empty the
 * start page still works from the in-memory collections, just with a shorter
 * reach. Every call therefore resolves rather than rejects, and callers are not
 * expected to handle failure.
 */
var RationFileStore = (function () {
    'use strict';

    const DB_NAME    = 'rationdocs.files';
    const DB_VERSION = 1;
    const STORE      = 'files';

    // Bounded so a long-lived install cannot grow without limit. Pruning drops
    // the least recently seen entries, which are also the least likely to be
    // searched for.
    const MAX_ENTRIES  = 5000;
    const PRUNE_TARGET = 4000;

    let _db = null;
    let _openPromise = null;
    let _available = (typeof indexedDB !== 'undefined' && indexedDB !== null);

    function _open() {
        if (_openPromise) return _openPromise;
        _openPromise = new Promise(function (resolve) {
            if (!_available) return resolve(null);
            let req;
            try {
                req = indexedDB.open(DB_NAME, DB_VERSION);
            } catch (e) {
                _available = false;
                return resolve(null);
            }
            req.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    const os = db.createObjectStore(STORE, { keyPath: 'key' });
                    os.createIndex('by_lastSeen', 'lastSeen');
                    os.createIndex('by_lastOpened', 'lastOpened');
                }
            };
            req.onsuccess = function (e) { _db = e.target.result; resolve(_db); };
            req.onerror   = function ()  { _available = false; resolve(null); };
            req.onblocked = function ()  { resolve(null); };
        });
        return _openPromise;
    }

    // A file is identified by its path. Case is folded because Windows and macOS
    // both treat paths case-insensitively by default, and the same file arriving
    // with different casing must not create a second entry.
    function _keyOf(rec) {
        const p = rec && (rec.path || rec.name);
        return p ? String(p).toLowerCase() : null;
    }

    function _searchable(rec) {
        return utils.fn.fold(
            [rec.name, rec.descr, rec.path].filter(Boolean).join(' ')
        );
    }

    function _normalise(rec, source, now) {
        const key = _keyOf(rec);
        if (!key) return null;
        return {
            key:      key,
            name:     rec.name || '',
            descr:    rec.descr || '',
            path:     rec.path || '',
            type:     rec.type,
            format:   rec.format,
            fileid:   rec.fileid,
            cloud:    rec.cloud,
            pinned:   !!rec.pinned,
            date:     rec.date || '',
            source:   source || 'recent',
            search:   _searchable(rec),
            lastSeen: now,
            lastOpened: 0,
            openCount: 0
        };
    }

    function _tx(mode) {
        return _open().then(function (db) {
            if (!db) return null;
            try { return db.transaction(STORE, mode).objectStore(STORE); }
            catch (e) { return null; }
        });
    }

    // Merge rather than overwrite: lastOpened and openCount are accumulated by
    // touch() and must survive a refresh of the pushed recents list.
    function _put(os, rec) {
        return new Promise(function (resolve) {
            const get = os.get(rec.key);
            get.onsuccess = function () {
                const prev = get.result;
                if (prev) {
                    rec.lastOpened = Math.max(prev.lastOpened || 0, rec.lastOpened || 0);
                    rec.openCount  = prev.openCount || 0;
                    if (!rec.date && prev.date) rec.date = prev.date;
                }
                const put = os.put(rec);
                put.onsuccess = function () { resolve(true); };
                put.onerror   = function () { resolve(false); };
            };
            get.onerror = function () { resolve(false); };
        });
    }

    return {
        available: function () { return _available; },

        ready: function () { return _open().then(function (db) { return !!db; }); },

        /* Bulk upsert of a pushed recents or recovery list. */
        upsertMany: function (records, source) {
            const now = Date.now();
            const rows = (records || []).map(function (r) { return _normalise(r, source, now); })
                                        .filter(Boolean);
            if (!rows.length) return Promise.resolve(0);
            return _tx('readwrite').then(function (os) {
                if (!os) return 0;
                return Promise.all(rows.map(function (r) { return _put(os, r); }))
                    .then(function (res) { return res.filter(Boolean).length; });
            }).catch(function () { return 0; });
        },

        /* Record an actual open. This is the interception point that lets the
           index outlive the core's capped recents list. */
        touch: function (record, source) {
            const now = Date.now();
            const row = _normalise(record, source, now);
            if (!row) return Promise.resolve(false);
            row.lastOpened = now;
            return _tx('readwrite').then(function (os) {
                if (!os) return false;
                return new Promise(function (resolve) {
                    const get = os.get(row.key);
                    get.onsuccess = function () {
                        const prev = get.result;
                        row.openCount = ((prev && prev.openCount) || 0) + 1;
                        if (prev && !row.date) row.date = prev.date;
                        const put = os.put(row);
                        put.onsuccess = function () { resolve(true); };
                        put.onerror   = function () { resolve(false); };
                    };
                    get.onerror = function () { resolve(false); };
                });
            }).catch(function () { return false; });
        },

        /* All terms must be present. Results are ordered by most recently opened,
           then most recently seen, so the ranking matches what the user last did
           rather than what the core last pushed. */
        search: function (terms, limit) {
            const max = limit || 50;
            if (!terms || !terms.length) return Promise.resolve([]);
            return _tx('readonly').then(function (os) {
                if (!os) return [];
                return new Promise(function (resolve) {
                    const hits = [];
                    const cur = os.openCursor();
                    cur.onsuccess = function (e) {
                        const c = e.target.result;
                        if (!c) return resolve(_rank(hits).slice(0, max));
                        const row = c.value;
                        const hay = row.search || '';
                        let ok = true;
                        for (let i = 0; i < terms.length; i++) {
                            if (hay.indexOf(terms[i]) === -1) { ok = false; break; }
                        }
                        if (ok) hits.push(row);
                        c.continue();
                    };
                    cur.onerror = function () { resolve([]); };
                });
            }).catch(function () { return []; });
        },

        count: function () {
            return _tx('readonly').then(function (os) {
                if (!os) return 0;
                return new Promise(function (resolve) {
                    const r = os.count();
                    r.onsuccess = function () { resolve(r.result || 0); };
                    r.onerror   = function () { resolve(0); };
                });
            }).catch(function () { return 0; });
        },

        /* Drop the least recently seen entries once the store grows past its cap. */
        prune: function () {
            return this.count().then(function (n) {
                if (n <= MAX_ENTRIES) return 0;
                const drop = n - PRUNE_TARGET;
                return _tx('readwrite').then(function (os) {
                    if (!os) return 0;
                    return new Promise(function (resolve) {
                        let removed = 0;
                        const cur = os.index('by_lastSeen').openCursor();
                        cur.onsuccess = function (e) {
                            const c = e.target.result;
                            if (!c || removed >= drop) return resolve(removed);
                            c.delete();
                            removed++;
                            c.continue();
                        };
                        cur.onerror = function () { resolve(removed); };
                    });
                });
            }).catch(function () { return 0; });
        },

        clear: function () {
            return _tx('readwrite').then(function (os) {
                if (!os) return false;
                return new Promise(function (resolve) {
                    const r = os.clear();
                    r.onsuccess = function () { resolve(true); };
                    r.onerror   = function () { resolve(false); };
                });
            }).catch(function () { return false; });
        },

        _rank: _rank
    };

    function _rank(rows) {
        return rows.sort(function (a, b) {
            if ((b.lastOpened || 0) !== (a.lastOpened || 0)) return (b.lastOpened || 0) - (a.lastOpened || 0);
            return (b.lastSeen || 0) - (a.lastSeen || 0);
        });
    }
})();
