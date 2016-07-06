tinymce.PluginManager.add('example', function(editor, url) {
    editor.addMenuItem('example', {
        text: 'Table of contents',
        context: 'tools',
        onclick: function() {
            editor.windowManager.open({
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
                        label: 'Indentation (in spaces)',
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
                onsubmit: function(e) {
                    var contentNode,
                        higherTitle,
                        depth = e.data.depth,
                        indentation = e.data.indentation,
                        tableClass = e.data.table_class,
                        addLinks = e.data.add_links,
                        table;

                    contentNode = document.createElement('html');
                    contentNode.innerHTML = tinyMCE.activeEditor.getContent({format : 'raw'});

                    higherTitle = getHigherTitle(contentNode);
                    table = createTable(contentNode, depth, indentation, tableClass, higherTitle, addLinks);

                    editor.insertContent(table);

                    _sectionsConcat = '';
                    _sectionsCounter = [];
                }
            });
        }
    });

    var _sectionsConcat = '',
        _sectionsCounter = [];

    function getHigherTitle(contentNode) {
        var titles = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            higherTitle = false,
            capturedTitles,
            index;

        for (index = 0; index < titles.length; index++) {
            capturedTitles = contentNode.getElementsByTagName(titles[index]);

            if (capturedTitles.length > 0) {
                higherTitle = titles[index];
                break;
            }
        }

        higherTitle = higherTitle.toLowerCase().replace('h', '');

        return higherTitle;
    }

    function createTable(contentNode, depth, indentation, tableClass, higherTitle, addLinks) {
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

        for (index = 0; index < depth; index++) {
            titles.push('h' + (parseInt(higherTitle) + parseInt(index)));
        }

        for (index = 0; index < titles.length; index++) {
            capturedTitles = contentNode.getElementsByTagName(titles[index]);

            for (titleIndex = 0; titleIndex < capturedTitles.length; titleIndex++) {
                currentTitle = capturedTitles[titleIndex];
                currentTitle.className += ' ' + className;
            }
        }

        orderedTitles = contentNode.getElementsByClassName(className);

        table = '<div class="' + tableClass + '">';

        for (index = 0; index < orderedTitles.length; index++) {
            titleIndex = orderedTitles[index].tagName.toLowerCase().replace('h', '');
            generatedIndentation = generateIndentation(higherTitle, titleIndex, indentation);

            titleValue = orderedTitles[index].innerHTML.replace('<br>', '');
            tableLine = generatedIndentation + titleValue + '<br>';

            if (addLinks) {
                originalId = orderedTitles[index].id;

                if (originalId === '') {
                    linkLocation = createLink(higherTitle, titleIndex, index + 1);
                    addIdToTitle(linkLocation, 'h' + titleIndex.toString(), titleValue);

                    linkLocation = '<a href="' + linkLocation + '">';
                } else {
                    linkLocation = '<a href="' + originalId + '">';
                }

                tableLine = linkLocation + tableLine + '</a>';
            }

            table += tableLine;
        }

        table += '</div>';

        return table;
    }

    function generateIndentation(higherTitle, currentTitle, indentationLevel) {
        var depth,
            index,
            indentation = '';

        depth = currentTitle - higherTitle;

        for (index = 0; index < depth * indentationLevel; index++) {
            indentation += '&nbsp;';
        }

        return indentation;
    }

    function createLink(higherTitleIndex, currentTitleIndex, sectionNumber) {
        var sectionIndex,
            link,
            isTopSection,
            index;

        sectionIndex = currentTitleIndex - higherTitleIndex;

        if (_sectionsCounter[sectionIndex] === undefined || _sectionsCounter[sectionIndex] === null) {
            _sectionsCounter[sectionIndex] = 1
        } else {
            _sectionsCounter[sectionIndex]++;
        }

        link = '#section_';

        for (index = 0; index <= sectionIndex; index++) {
            link += _sectionsCounter[index] + '_';
        }

        link = link.slice(0, -1);

        isTopSection = sectionIndex === 0;

        if (isTopSection) {
            for (index = 1; index < _sectionsCounter.length; index++) {
                _sectionsCounter[index] = null;
            }
        }

        return link;
    }

    function addIdToTitle(id, titleTag, titleValue) {
        var editorDocument = tinyMCE.activeEditor.getBody(),
            documentTitles,
            index,
            titleNode,
            titleNodeValue;

        documentTitles = editorDocument.getElementsByTagName(titleTag);

        for (index = 0; index < documentTitles.length; index++) {
            titleNode = documentTitles[index];
            titleNodeValue = titleNode.innerHTML.replace('<br>', '');

            if (titleNodeValue === titleValue && titleNode.id === '') {
                titleNode.id = id;
                break;
            }
        }
    }

});
