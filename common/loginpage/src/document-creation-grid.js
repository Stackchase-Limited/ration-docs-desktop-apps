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

"use strict";

/**
 * Document Creation Grid - Shows cards for creating new documents
 *
 * @param {Object} config
 * @param {Array} config.documentTypes - Document types to show
 * @param {Function} config.onDocumentSelect - Called when user selects a document
 *
 * Document Type Object:
 * - id: unique identifier
 * - title: display name
 * - icon: icon reference (e.g., '#docx-big')
 *
 * @example
 * const docGrid = new DocumentCreationGrid({
 *   documentTypes: [
 *     {
 *       id: 'docx',
 *       title: 'Word Document',
 *       icon: '#docx-big'
 *     }
 *   ],
 *   onDocumentSelect: (docType) => console.log(docType)
 * });
 */
window.DocumentCreationGrid = function (config = {}) {
	const {
		documentTypes = [],
		onDocumentSelect = null
	} = config;


	let $el, $parent;

	/**
	 * Global handler for document selection
	 * @param {string} docType - Selected document type ID
	 * @param {HTMLElement} element - Clicked element
	 */
	window.DocumentCreationGrid.handleDocumentSelect = function (docType, element) {
		const selectedDoc = documentTypes.find(doc => doc.id === docType);

		if (!selectedDoc) {
			console.warn('Document type not found:', docType);
			return;
		}

		if (onDocumentSelect && typeof onDocumentSelect === 'function') {
			onDocumentSelect(docType, selectedDoc, element);
		}
	};

	return {
		/**
		 * Renders the component in the specified parent element
		 * @param {jquery} parentElement - Parent element to render the component in
		 */
		render: (parentElement) => {
			if (!parentElement) {
				throw new Error('Parent element is required for rendering');
			}

			// The Ration Docs design draws each tile as a stroked page outline with a
			// folded corner, a solid format chip and a two-line label. `glyph` picks
			// the extra strokes inside the page; `chip`/`meta` are optional so a
			// caller that supplies neither still gets the plain sprite icon.
			const _glyphs = {
				cell:  '<path d="M13 30h20M13 38h20M21 24v20"/>',
				slide: '<rect x="13" y="26" width="20" height="13"/>',
			};

			//language=HTML
			const _template = `
                <div class="document-creation-grid">
                    ${documentTypes.map(doc => `
                    <div class="document-creation-item" data-id="${doc.id}" data-format="${doc.chip ? doc.chip.toLowerCase() : ''}" onclick="window.DocumentCreationGrid.handleDocumentSelect('${doc.id}', this)">
                        ${doc.chip ? `
                        <div class="rd-glyph">
                            <svg viewBox="0 0 46 56" aria-hidden="true">
                                <path d="M6 2h24l10 10v42H6z"/>
                                <path d="M30 2v10h10"/>
                                ${_glyphs[doc.id] || ''}
                            </svg>
                            <span class="rd-chip">${doc.chip}</span>
                        </div>` :
						(doc.icon.startsWith('#') ? `<svg class="icon"><use xlink:href="${doc.icon}"></use></svg>` : `<i class="icon ${doc.icon}"></i>`)}

                        <div class="title" l10n="${doc.langKey}">
                            ${doc.title}
                        </div>
                        ${doc.meta ? `<div class="rd-meta">${doc.meta}</div>` : ''}
                    </div>
                `).join('')}
                </div>`;

			$parent = parentElement;
			$el = $parent.append(_template).find('.document-creation-grid');
		},
	};
};
