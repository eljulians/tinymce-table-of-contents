(function() {
    var _sectionsConcat = '',
        _sectionsCounter = [],
        _previousDepth = -1;

    tinymce.PluginManager.add( 'table_of_contents', function( editor, url ) {

        // Add Button to Visual Editor Toolbar
        editor.addButton('table_of_contents', {
            title: 'Table of contents',
            cmd: 'table_of_contents',
        });
        editor.addCommand( 'table_of_contents', function(){
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

        table = '<div class="' + tableClass + '">';
        table += '<dl>';

        for ( index = 0; index < orderedTitles.length; index++ ) {
            titleIndex = orderedTitles[index].tagName.toLowerCase(  ).replace( 'h', '' );

            titleValue = orderedTitles[index].innerHTML.replace( '<br>', '' );

            generatedIndentation = generateIndentation( higherTitle, titleIndex, titleValue );

            tableLine = generatedIndentation;

            if ( addLinks ) {
                originalId = orderedTitles[index].id;

                if ( '' === originalId ) {
                    linkLocation = createLink( higherTitle, titleIndex, index + 1 );
                    addIdToTitle( linkLocation, 'h' + titleIndex.toString(  ), titleValue );

                    linkLocation = '<a href="' + linkLocation + '">';

                 } else {
                    linkLocation = '<a href="' + originalId + '">';
                 }

                tableLine = tableLine.replace( '{anchor_start}', linkLocation );
                tableLine = tableLine.replace( '{anchor_end}', '</a>' );
            } else {
                tableLine = tableLine.replace( '{anchor_start}', '' );
                tableLine = tableLine.replace( '{anchor_end}', '' );
            }

            table += tableLine;
         }

        table += '</dl>';
        table += '</div>';

        return table;
     }

    /**
     * Generates the indentation for a given entry for the table of contents. The depth of the indentation is
     * calculated by the difference between the higher title level of the current document, and the current title. For
     * example, if the higher, parent title is <h2>, and the current title is <h2>, then the depth would be 0; 1 for
     * <h3>, etc. ( obviously, the number of the heading tags is passed, and not all the <hX> tag ).
     *
     * For the indentation, description lists (<dl>) are used. The first attempt had been just adding leading spaces,
     * but the resulting table was a bit ugly (the leading spaces where also selectable, if links were included).
     *
     * The format of a table of contents created with description list is the following:
     *
     * <dl>
     *     <dt>1.</dt>
     *     <dd>1.1.</dd>
     *     <dl>
     *         <dd>1.1.1.</dd>
     *         <dl>
     *             <dd>1.1.1.1.</dd>
     *             <dl>
     *                 <dd>1.1.1.1.1.</dd>
     *             </dl>
     *         </dl>
     *     </dl>
     * </dl>
     *
     * And so on.
     *
     * The "switch (true)" is a trick for using a switch to evaluate ranges.
     *
     * @param { int } higherTitle - The higher title index ( 1 for h1, 2 for h2, etc. ) for the document.
     * @param { int } currentTitle - The title index of the table of contents entry for which the indentation is going to
     *     be calculated for.
     * @param { int } title - The title name.
     * @return { string } String with whitespaces as indentation.
     */
    function generateIndentation( higherTitle, currentTitle, title ) {
        var depth,
            index,
            indentation = '',
            closingListChain = '';

        depth = currentTitle - higherTitle;

        if ( depth < _previousDepth && 1 < _previousDepth ) {

            while ( _previousDepth > depth ) {
                closingListChain += '</dl>';
                _previousDepth--;
            }
        }


        switch ( true ) {
            case ( 0 === depth ):
                title = closingListChain + '<dt>{anchor_start}' + title + '{anchor_end}</dt>';
                break;

            case ( 1 === depth ):
                title = closingListChain + '<dd>{anchor_start}' + title + '{anchor_end}</dd>';
                break;

            case ( 1 < depth ):
                if ( depth > _previousDepth ) {
                    title = closingListChain + '<dl><dd>{anchor_start}' + title + '{anchor_end}</dd>';
                } else {
                    title = closingListChain + '<dd>{anchor_start}' + title + '{anchor_end}</dd>';
                }
                break;
        }

        _previousDepth = depth;

        return title;
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
