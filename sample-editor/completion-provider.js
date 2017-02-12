function getLastOpenedTag(text) {
	var tags = text.match(/<\/*(?=\S*)([a-zA-Z-]+)/g);
	if (!tags) {
		return undefined;
	}
	var closingTags = [];
	for (var i = tags.length - 1; i >= 0; i--) {
		if (tags[i].indexOf('</') === 0) {
			closingTags.push(tags[i].substring('</'.length));
		}
		else {
			var tagPosition = text.lastIndexOf(tags[i]);
			var tag = tags[i].substring('<'.length);
			var closingBracketIdx = text.indexOf('/>', tagPosition);
			if (closingBracketIdx === -1) {
				if (!closingTags.length || closingTags[closingTags.length - 1] !== tag) {
					return tag;
				}
				closingTags.splice(closingTags.length - 1, 1);
			}
			text = text.substring(0, tagPosition);
		}
	}
}

function getAreaInfo(text) {
	var items = ['"', '\'', '<!--', '<![CDATA['];
	var isCompletionAvailable = true;
	text = text.replace(/"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g, '');
	for (var i = 0; i < items.length; i++) {
		var itemIdx = text.indexOf(items[i]);
		if (itemIdx > -1) {
			text = text.substring(0, itemIdx);
			isCompletionAvailable = false;
		}
	}
	return {
		isCompletionAvailable: isCompletionAvailable,
		clearedText: text
	};
}

function findElements(elements, elementName) {
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].tagName === 'complexType' || elements[i].tagName === 'all' || elements[i].tagName === 'sequence') {
			var child = findElements(elements[i].children, elementName);
			if (child) {
				return child;
			}
		}
		else if (!elementName) {
			return elements;
		}
		else if (getElementAttributes(elements[i]).name === elementName) {
			return elements[i];
		}
	}
}

function getElementAttributes(element) {
	var attrs = {};
	for (var i = 0; i < element.attributes.length; i++) {
		attrs[element.attributes[i].name] = element.attributes[i].value;
	}
	return attrs;
}



function getAvailableItems(monaco, elements, unavailableItems) {
	var availableItems = [];
	var children = findElements(elements);
	if (!children) {
		return [];
	}
	for (var i = 0; i < children.length; i++) {
		let elementAttrs = getElementAttributes(children[i]);
		if (unavailableItems.indexOf(elementAttrs.name) === -1) {
			availableItems.push({
				label: elementAttrs.name,
				kind: monaco.languages.CompletionItemKind.Class,
				detail: elementAttrs.type
			});
		}
	}
	return availableItems;
}

function registerCompletionProvider(monaco) {
	monaco.languages.registerCompletionItemProvider('xml', {
		triggerCharacters: ['<'],
		provideCompletionItems: function(model, position) {
			var textUntilPosition = model.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column});
			var areaUntilPositionInfo = getAreaInfo(textUntilPosition);
			if (!areaUntilPositionInfo.isCompletionAvailable) {
				return [];
			}
			var lastOpenedTag = getLastOpenedTag(areaUntilPositionInfo.clearedText);
			var xmlDoc = stringToXml(textUntilPosition);

			var openedTags = [];
			var usedChildTags = [];
			var lastChild = xmlDoc.lastElementChild;
			while (lastChild) {
				openedTags.push(lastChild.tagName);
				if (lastChild.tagName === lastOpenedTag) {
					var children = lastChild.children;
					for (var i = 0; i < children.length; i++) {
						usedChildTags.push(children[i].tagName);
					}
					break;
				}
				lastChild = lastChild.lastElementChild;
			}
			var currentItem = schemaNode;
			for (var i = 0; i < openedTags.length; i++) {
				currentItem = findElements(currentItem.children, openedTags[i]);
			}
			return currentItem ? getAvailableItems(monaco, currentItem.children, usedChildTags) : [];
		}
	});
}