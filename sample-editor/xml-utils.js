var xmlSchemaString =
`<?xml version="1.0" encoding="UTF-8" ?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
<xs:element name="shiporder">
  <xs:annotation>
    <xs:documentation>Details for order shipping.</xs:documentation>
  </xs:annotation>
  <xs:complexType>
    <xs:sequence>
      <xs:element name="orderperson" type="xs:string">
      <xs:annotation>
        <xs:documentation>Person that will handle the order.</xs:documentation>
      </xs:annotation>
      </xs:element>
      <xs:element name="shipto">
        <xs:annotation>
          <xs:documentation>Details of order reciever.</xs:documentation>
        </xs:annotation>
        <xs:complexType>
          <xs:sequence>
            <xs:element name="name" type="xs:string">
              <xs:annotation>
                <xs:documentation>Receiver name.</xs:documentation>
              </xs:annotation>
            </xs:element>
            <xs:element name="address" type="xs:string">
              <xs:annotation>
                <xs:documentation>Receiver address.</xs:documentation>
              </xs:annotation>
            </xs:element>
            <xs:element name="city" type="xs:string">
              <xs:annotation>
                <xs:documentation>Receiver city.</xs:documentation>
              </xs:annotation>
            </xs:element>
            <xs:element name="country" type="xs:string">
              <xs:annotation>
                <xs:documentation>Receiver country.</xs:documentation>
              </xs:annotation>
            </xs:element>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
      <xs:element name="item" maxOccurs="unbounded">
        <xs:annotation>
          <xs:documentation>Order item.</xs:documentation>
        </xs:annotation>
        <xs:complexType>
          <xs:sequence>
            <xs:element name="title" type="xs:string">
              <xs:annotation>
                <xs:documentation>Item title.</xs:documentation>
              </xs:annotation>
            </xs:element>
            <xs:element name="note" type="xs:string" minOccurs="0">
              <xs:annotation>
                <xs:documentation>Item note.</xs:documentation>
              </xs:annotation>
            </xs:element>
            <xs:element name="quantity" type="xs:positiveInteger">
              <xs:annotation>
                <xs:documentation>Quantity of the item.</xs:documentation>
              </xs:annotation>
            </xs:element>
            <xs:element name="price" type="xs:decimal">
              <xs:annotation>
                <xs:documentation>Item price.</xs:documentation>
              </xs:annotation>
            </xs:element>
          </xs:sequence>
        </xs:complexType>
      </xs:element>
    </xs:sequence>
    <xs:attribute name="orderid" type="xs:string" use="required">
      <xs:annotation>
        <xs:documentation>Attribute example.</xs:documentation>
      </xs:annotation>
    </xs:attribute>
  </xs:complexType>
</xs:element>
</xs:schema>`.replace(/xs\:/g, '')

function stringToXml(text) {
	var xmlDoc;
	if (window.DOMParser) {
		var parser = new DOMParser();
		xmlDoc = parser.parseFromString(text, 'text/xml');
	}
	else {
		xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
		xmlDoc.async = false;
		xmlDoc.loadXML(text);
	}
	return xmlDoc;
}

var schemaNode = stringToXml(xmlSchemaString).childNodes[0];
