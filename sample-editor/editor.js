require.config({ paths: { 'vs': '../node_modules/monaco-editor/min/vs' }});

require(['vs/editor/editor.main'], function() {
	var editor = monaco.editor.create(document.getElementById('container'), {
		value: '<?xml version="1.0" encoding="UTF-6"?>\n',
		language: 'xml'
	});
});