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
					text = text.substring(tagPosition);
					return {
						tagName: tag,
						isAttributeSearch: text.indexOf('<') > text.indexOf('>')
					};
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

function shouldSkipLevel(tagName) {
	return tagName === 'complexType' || tagName === 'all' || tagName === 'sequence';
}

function findElements(elements, elementName) {
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].tagName !== 'annotation' && elements[i].tagName !== 'attribute') {
			if (shouldSkipLevel(elements[i].tagName)) {
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
}

function findAttributes(elements) {
	var attrs = [];
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].tagName === 'complexType') {
			var child = findAttributes(elements[i].children);
			if (child) {
				return child;
			}
		}
		else if (elements[i].tagName === 'attribute') {
			attrs.push(elements[i]);
		}
	}
	return attrs;
}

function getElementAttributes(element) {
	var attrs = {};
	for (var i = 0; i < element.attributes.length; i++) {
		attrs[element.attributes[i].name] = element.attributes[i].value;
	}
	return attrs;
}

function getItemDocumentation(element) {
	for (var i = 0; i < element.children.length; i++) {
		if (element.children[i].tagName === 'annotation') {
			return getItemDocumentation(element.children[0]);
		}
		else if (element.children[i].tagName === 'documentation') {
			return element.children[i].textContent;
		}
	}
}

function getAppereanceCount(itemName, items) {
	var count = 0;
	for (var i = 0; i < items.length; i++) {
		if (items[i] === itemName) {
			count++;
		}
	}
	return count;
}

function isItemAvailable(itemName, maxOccurs, items) {
	maxOccurs = maxOccurs || '1';
	if (maxOccurs && maxOccurs === 'unbounded') {
		return true;
	}
	var count = 0;
	for (var i = 0; i < items.length; i++) {
		if (items[i] === itemName) {
			count++;
		}
	}
	return count === 0 || parseInt(maxOccurs) > count;
}

function getAvailableElements(monaco, elements, usedItems) {
	var availableItems = [];
	var children;
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].tagName !== 'annotation') {
			children = findElements([elements[i]])
		}
	}
	if (!children) {
		return [];
	}
	for (var i = 0; i < children.length; i++) {
		let elementAttrs = getElementAttributes(children[i]);
		if (isItemAvailable(elementAttrs.name, elementAttrs.maxOccurs, usedItems)) {
			availableItems.push({
				label: elementAttrs.name,
				kind: monaco.languages.CompletionItemKind.Field,
				detail: elementAttrs.type,
				documentation: getItemDocumentation(children[i])
			});
		}
	}
	return availableItems;
}

function getAvailableAttribute(monaco, elements, usedChildTags) {
	var availableItems = [];
	var children;
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].tagName !== 'annotation') {
			children = findAttributes([elements[i]])
		}
	}
	if (!children) {
		return [];
	}
	for (var i = 0; i < children.length; i++) {
		var attrs = getElementAttributes(children[i]);
		if (isItemAvailable(attrs.name, attrs.maxOccurs, usedChildTags)) {
			availableItems.push({
				label: attrs.name,
				kind: monaco.languages.CompletionItemKind.Property,
				detail: attrs.type,
				documentation: getItemDocumentation(children[i])
			});
		}
	}
	return availableItems;
}

function getXmlCompletionProvider(monaco) {
	return {
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
			var usedItems = [];
			var lastChild = xmlDoc.lastElementChild;
			while (lastChild) {
				openedTags.push(lastChild.tagName);
				if (lastChild.tagName === lastOpenedTag.tagName) {
					if (lastOpenedTag.isAttributeSearch) {
						var attrs = lastChild.attributes;
						for (var i = 0; i< attrs.length; i++) {
							usedItems.push(attrs[i].nodeName);
						}
					}
					else {
						var children = lastChild.children;
						for (var i = 0; i < children.length; i++) {
							usedItems.push(children[i].tagName);
						}
					}
					break;
				}
				lastChild = lastChild.lastElementChild;
			}
			var currentItem = schemaNode;
			for (var i = 0; i < openedTags.length; i++) {
				if (currentItem) {
					currentItem = findElements(currentItem.children, openedTags[i]);
				}
			}

			if (lastOpenedTag.isAttributeSearch) {
				// get attributes completions
				return currentItem ? getAvailableAttribute(monaco, currentItem.children, usedItems) : [];
			}
			else {
				// get elements completions
				return currentItem ? getAvailableElements(monaco, currentItem.children, usedItems) : [];
			}
		}
	}
}
