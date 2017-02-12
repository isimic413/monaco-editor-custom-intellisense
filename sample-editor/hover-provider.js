function getXmlHoverProvider(monaco) {
	return {
		provideHover: function(model, position) {
			return {
				contents: [
					'**Text until hover**',
					{
						language: 'xml',
						value: model.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column})
					}
				]
			}
		}
	};
}
