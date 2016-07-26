// This file is part of TinyMCE Table of Contents - https://github.com/julenpardo/tinymce-table-of-contents
//
// TinyMCE Table of Contents is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// TinyMCE Table of Contents is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with TinyMCE Table of Contents.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Plugin Name: TinyMCE Table of Contents
 * Version: 1.0
 * Plugin URI: https://github.com/julenpardo/tinymce-table-of-contents
 * Author: Julen Pardo
 * Author URI: https://github.com/julenpardo
 * Description: Completely automated and instantaneous way of generating tables of contents for posts.
 * Tested up to: 4.5
 * License: GPLv3
 */

(function() {
    var _sectionsConcat = '',
        _sectionsCounter = [],
        _previousDepth = -1;

    tinymce.PluginManager.add( 'table_of_contents', function( editor, url ) {

        // Add Button to Visual Editor Toolbar
        editor.addButton( 'table_of_contents', {
            title: 'Table of contents',
            cmd: 'table_of_contents',
            image: url + '/../img/table-of-contents.png'
        });
        editor.addCommand( 'table_of_contents', function() {
            editor.windowManager.open( {
                title: 'Table of contents',
                body: [
                    {
                        type: 'textbox',
                        name: 'depth',
                        label: 'Table depth',
                        value: '2'
                     },
                    {
                        type: 'textbox',
                        name: 'indentation',
                        label: 'Indentation ( in spaces )',
                        value: '4'
                     },
                    {
                        type: 'textbox',
                        name: 'table_class',
                        label: 'Table class',
                        value: 'toc'
                     },
                    {
                        type: 'checkbox',
                        name: 'add_links',
                        label: 'Add links to sections',
                        checked: true
                     }
                ],
                onsubmit: function( e ) {
                     var contentNode,
                        higherTitle,
                        depth = e.data.depth,
                        indentation = e.data.indentation,
                        tableClass = e.data.table_class,
                        addLinks = e.data.add_links,
                        table;

                    contentNode = document.createElement( 'html' );
                    contentNode.innerHTML = tinyMCE.activeEditor.getContent( { format: 'raw' } );

                    higherTitle = getHigherTitle( contentNode );

                    table = createTable( contentNode, depth, indentation, tableClass, higherTitle, addLinks );
                    editor.insertContent( table );

                    _sectionsConcat = '';
                    _sectionsCounter = [];
                 }
             } );
        });
    });

    /**
     * Gets the higher title of the document. This is necessary because we don't know if the content in the editor is
     * using h1, h2, etc. as top level for its headings.
     *
     * @param { string } contentNode - The editor content.
     * @return { int } The higher title index ( 1 for h1, 2 for h2, etc ).
     */
    function getHigherTitle( contentNode ) {
        var titles = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            higherTitle = false,
            capturedTitles,
            index;

        for ( index = 0; index < titles.length; index++ ) {
            capturedTitles = contentNode.getElementsByTagName( titles[index] );

            if ( capturedTitles.length > 0 ) {
                higherTitle = titles[index];
                break;
             }
         }

        higherTitle = higherTitle.toLowerCase(  ).replace( 'h', '' );

        return higherTitle;
     }

    /**
     * Creates the table of contents. First, all the titles of the document are retrieved and a common class is added
     * to all of them, to then retrieve the titles in order. Then, the entries are added, with the indentation and the
     * links, if specified, are added.
     *
     * @param { string } contentNode - The editor content.
     * @param { int } depth - The depth of the table specified by the user.
     * @param { int } indentation - The indentation in spaces specified by the user.
     * @param { string } tableClass - The class name to add to the table specified by the user.
     * @param { int } higherTitle - The higher title of the document.
     * @param { boolean } addLinks - If tables' entries have to have a link to the corresponding section ( this is also
     *     specified by the user ).
     * @return { string } The table of contents.
     */
    function createTable( contentNode, depth, indentation, tableClass, higherTitle, addLinks ) {
        var titles = [],
            capturedTitles,
            currentTitle,
            className = 'tinymce-table-of-contents',
            index,
            titleIndex,
            orderedTitles,
            titleIndex,
            generatedIndentation,
            linkLocation,
            originalId,
            tableLine,
            titleValue,
            table;

        for ( index = 0; index < depth; index++ ) {
            titles.push( 'h' + ( parseInt( higherTitle ) + parseInt( index ) ) );
         }

        for ( index = 0; index < titles.length; index++ ) {
            capturedTitles = contentNode.getElementsByTagName( titles[index] );

            for ( titleIndex = 0; titleIndex < capturedTitles.length; titleIndex++ ) {
                currentTitle = capturedTitles[titleIndex];
                currentTitle.className += ' ' + className;
             }
         }

        orderedTitles = contentNode.getElementsByClassName( className );

        table = '<div class="tinymce-table-of-contents ' + tableClass + '">';

        for ( index = 0; index < orderedTitles.length; index++ ) {
            titleIndex = orderedTitles[index].tagName.toLowerCase(  ).replace( 'h', '' );

            titleValue = orderedTitles[index].innerHTML.replace( '<br>', '' );

            generatedIndentation = generateIndentation( higherTitle, titleIndex, indentation );

            if ( addLinks ) {
                originalId = orderedTitles[index].id;

                if ( '' === originalId ) {
                    linkLocation = createLink( higherTitle, titleIndex, index + 1 );
                    addIdToTitle( linkLocation, 'h' + titleIndex.toString(  ), titleValue );

                    linkLocation = '<a href="' + linkLocation + '">';

                 } else {
                    linkLocation = '<a href="' + originalId + '">';
                 }

                tableLine = generatedIndentation + linkLocation + titleValue + '</a>' + '<br>';
            } else {
                tableLine = generatedIndentation + titleValue + '<br>';
            }

            table += tableLine;
         }

        table += '</div>';

        return table;
     }

    /**
     * Generates the indentation for a given entry for the table of contents. The depth of the indentation is
     * calculated by the difference between the higher title level of the current document, and the current title. For
     * example, if the higher, parent title is <h2>, and the current title is <h2>, then the depth would be 0; 1 for
     * <h3>, etc. ( obviously, the number of the heading tags is passed, and not all the <hX> tag ).
     *
     * Then, the number of spaces is just the depth multiplied by the indentation level. '&nbsp;' entity is used
     * because seems that the whitespaces are being ignored.
     *
     * @param { int } higherTitle - The higher title index ( 1 for h1, 2 for h2, etc. ) for the document.
     * @param { int } currentTitle - The title index of the table of contents entry for which the indentation is going to
     *     be calculated for.
     * @param { int } indentationLevel - The indentation level, in spaces, specified by the user.
     * @param { string } String with whitespaces as indentation.
     */
    function generateIndentation( higherTitle, currentTitle, indentationLevel ) {
        var depth,
            index,
            indentation = '';

        depth = currentTitle - higherTitle;

        for ( index = 0; index < depth * indentationLevel; index++ ) {
            indentation += '&nbsp;';
        }

        indentation = '<span style="white-space: pre;">' + indentation + '</span>';

        return indentation;
    }

    /**
     * Creates the link for the element of the table of contents that points to the corresponding title section in the
     * body.
     *
     * A global array '_sectionsCounter' has to accumulate the sections, to know which number corresponds to the
     * current section.
     *
     * The 'sectionIndex' variable holds the level of the link to the section, 1 for h1, 2 for h2, etc., so, each
     * section index knows which value corresponds to it.
     *
     * If the given title index is the top index ( equal to 'higherTitleIndex' ), then, the accumulation of the count of
     * the sections is resetted, to start from 0 for the subsequent sections.
     *
     * @param { int } higherTitleIndex - The higher title index ( 1 for h1, 2 for h2, etc. ) for the document.
     * @param { int } currentTitleIndex - The title index of the title the link is going to point to.
     * @return { string } The link to the section title.
     */
    function createLink( higherTitleIndex, currentTitleIndex ) {
        var sectionIndex,
            link,
            isTopSection,
            index;

        sectionIndex = currentTitleIndex - higherTitleIndex;

        if ( undefined === _sectionsCounter[sectionIndex] || null === _sectionsCounter[sectionIndex] ) {
            _sectionsCounter[sectionIndex] = 1;
         } else {
            _sectionsCounter[sectionIndex]++;
         }

        link = '#section_';

        for ( index = 0; index <= sectionIndex; index++ ) {
            link += _sectionsCounter[index] + '_';
         }

        link = link.slice( 0, -1 );

        isTopSection = 0 === sectionIndex;

        if ( isTopSection ) {
            for ( index = 1; index < _sectionsCounter.length; index++ ) {
                _sectionsCounter[index] = null;
             }
         }

        return link;
     }

    /**
     * Adds the specified 'id' attribute to the title tag of the 'titleTag' level ( h1, h2, etc. ), for the specified
     * tag, specified by 'titleValue'.
     *
     * To find the corresponding tag, the tags of the given level are iterated, until a tag with the value equal to
     * 'titleValue' is found.
     *
     * The id is only added if the corresponding title has no id assigned, not to override the original id.
     *
     * @param { strig } location - The the location of the section (#section_x).
     * @param { string } titleTag - The title tag ( h1, h2, etc. ) the tag to add the id corresponds to.
     * @param { string } titleValue - The value of the tag to add the id to, necessary to find its node.
     */
    function addIdToTitle( location, titleTag, titleValue ) {
        var editorDocument = tinyMCE.activeEditor.getBody(  ),
            id,
            documentTitles,
            index,
            titleNode,
            titleNodeValue;

        id = location.substring( 1 );
        documentTitles = editorDocument.getElementsByTagName( titleTag );

        for ( index = 0; index < documentTitles.length; index++ ) {
            titleNode = documentTitles[index];
            titleNodeValue = titleNode.innerHTML.replace( '<br>', '' );

            if ( titleNodeValue === titleValue && '' === titleNode.id ) {
                titleNode.id = id;
                break;
             }
         }
    }
})();
