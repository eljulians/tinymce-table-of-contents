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
                        table;

                    contentNode = document.createElement('html');
                    contentNode.innerHTML = tinyMCE.activeEditor.getContent({format : 'raw'});

                    higherTitle = getHigherTitle(contentNode);
                    table = createTable(contentNode, depth, indentation, tableClass, higherTitle);

                    editor.insertContent(table);
                }
            });
        }
    });

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

        return higherTitle;
    }

    function createTable(contentNode, depth, indentation, tableClass, higherTitle) {
        var titles = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
            capturedTitles,
            currentTitle,
            className = 'tinymce-table-of-contents',
            index,
            titleIndex,
            orderedTitles,
            titleIndex,
            generatedIndentation,
            table;

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

            table += generatedIndentation + orderedTitles[index].innerHTML.replace('<br>', '');
            table += '<br>';
        }

        table += '</div>';

        return table;
    }

    function generateIndentation(higherTitle, currentTitle, indentationLevel) {
    	var depth,
    		index,
    		indentation = '';

    	higherTitle = higherTitle.toLowerCase().replace('h', '');
    	depth = currentTitle - higherTitle;

    	for (index = 0; index < depth * indentationLevel; index++) {
    		indentation += '&nbsp;';
    	}

    	return indentation;
    }

});
