require.config({paths: { 'vs': '../node_modules/monaco-editor/min/vs' }});

require(['vs/editor/editor.main'], function() {
	var editor = monaco.editor.create(document.getElementById('container'), {
		theme: 'vs-dark',
		language: 'xml',
		suggestOnTriggerCharacters: true,
		value: `<?xml version="1.0" encoding="UTF-8"?>

<shiporder>
  <orderperson>John Smith</orderperson>
  <shipto>
    <name>Ola Nordmann</name>
    <address>Langgt 23</address>
    <city>4000 Stavanger</city>
    <country>Norway</country>
  </shipto>
  <item>
    <title>Empire Burlesque</title>
    <note>Special Edition</note>
    <quantity>1</quantity>
    <price>10.90</price>
  </item>
  <item>
    <title>Hide your heart</title>
    <quantity>1</quantity>
    <price>9.90</price>
  </item>
</shiporder>`
	});

	monaco.languages.registerCompletionItemProvider('xml', getXmlCompletionProvider(monaco));
});