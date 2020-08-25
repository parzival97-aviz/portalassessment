const express = require('express');
// const bodyParser = require('body-parser');
var http = require('follow-redirects').http;
const cors = require('cors');
var fs = require('fs');
const parser = require('xml-js');
var jwt = require('jsonwebtoken');
const axios = require('axios')
app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
const headers =  {
	'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw', 
	'Content-Type': 'text/xml'
}
app.use(cors());


var OPTIONS = {
	'method': 'POST',
	'port': 50000,
	'host': 'dxktpipo.kaarcloud.com',
	'headers': {
		'Content-Type': 'application/xml',
		'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
	},
	'maxRedirects': 20
};

//Validating the credentials data from SAP Ztable ZTA_CUST_AUTH


app.post('/login', (req, res) => {
	console.log("Cust_username,Cust_password");
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?channel=:BC_DJ:CC_V_SENDER',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
			
		},
		'maxRedirects': 20
	};
	
	
	const Cust_username = req.body.email;
	const Cust_password = req.body.password;
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:demo="http://DJ.com/demo">
	<soapenv:Header/>
	<soapenv:Body>
	   <demo:MT_V_REQ>
		  <UserName>${Cust_username}</UserName>
		  <Password>${Cust_password}</Password>
	   </demo:MT_V_REQ>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];
		
		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			console.log("trial5",xml);
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_V_RES'];
			let token;
			if(resp['Status']['_text']==='1 '){
				// login sucess
				token = jwt.sign({
                    id:'1631',
                    email: 'siva@gmail.com'
                }, 'siva', {
                    expiresIn: 604800
                });
			} else {
				token = null;
			}
			res.send({
				Status: resp['Status']['_text'],
				token: token,
				username: req.body.email
			});
		});

		res1.on("error", function (error) {
			console.error('probably SAP is not working',error);
			
		});
	});

	req1.write(postData);

	req1.end();
});

//displaying the profile data from SAP Ztable ZTA_CUST_PROFILE

app.post('/profile', async (req, res) => {
	const custUsername = req.body.custID
	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_CUSTOMERPROFILE>
	   
		  <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
		  <CUST_TABLE>
		 
			 <item>
			 </item>
		  </CUST_TABLE>
	   </urn:BAPI_CUSTOMERPROFILE>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Authorization&receiverParty=&receiverService=&interface=SI_OUT_Customerprofile_req&interfaceNamespace=http://sivaprakash.com/profile',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	data = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_CUSTOMERPROFILE.Response']['CUST_TABLE']['item']
	console.log(1e9+7, data)
	res.send(
		{
			cust_name: data['NAME1']['_text'],
			cust_email: data['KUNNR']['_text'],
			cust_phone: data['TELF1']['_text'],
			cust_city: data['ORT01']['_text'],
			cust_country: data['LAND1']['_text'],
			cust_pincode: data['PSTLZ']['_text'],
			cust_district: data['ORT01']['_text'],
			cust_state: data['REGIO']['_text'],
			cust_addr: data['STRAS']['_text'],
			cust_fax: data['TELFX']['_text'],
			cust_companyid: data['KUNNR']['_text'],
			cust_vat: data['KUNNR']['_text']}
	);
})

//Updating the profile data from SAP Ztable ZTA_CUST_PROFILE


app.post('/updateprofile', (req, res) => {
	console.log('received token is : ', req.headers.token);

	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_ProfileUpdate&receiverParty=&receiverService=&interface=SI_OUT_PUPDATE_REQ&interfaceNamespace=http://crimson-fern.com/update',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const Cust_username = req.body.custID;
	console.log(Cust_username);
	const Cust_name = req.body.Name;
	console.log(Cust_name);
	const Cust_email = req.body.Email;
	console.log(Cust_email);
	const Cust_phone = req.body.Phone;
	console.log(Cust_phone);
	const Cust_city = req.body.City;
	console.log(Cust_city);
	const Cust_country = req.body.Country;
	console.log(Cust_country);
	const Cust_pincode = req.body.Pincode;
	console.log(Cust_pincode);
	const Cust_district = req.body.District;
	console.log(Cust_district);
	const Cust_state = req.body.State;
	console.log(Cust_state);
	const Cust_addr = req.body.Address;
	console.log(Cust_addr);
	const Cust_fax = req.body.FAX;
	console.log(Cust_fax);
	const Cust_companyid = req.body.CompanyID;
	console.log(Cust_companyid);
	const Cust_vat = req.body.VAT;
	console.log(Cust_vat);
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:upd="http://dheepak.com/update">
	<soapenv:Header/>
	<soapenv:Body>
	   <upd:MT_PUPDATE_REQ>
		  <user_name>${Cust_username}</user_name>
		  <cust_name>${Cust_name}</cust_name>
		  <cust_email>${Cust_email}</cust_email>
		  <cust_phone>${Cust_phone}</cust_phone>
		  <cust_city>${Cust_city}</cust_city>
		  <cust_district>${Cust_district}</cust_district>
		  <cust_pincode>${Cust_pincode}</cust_pincode>
		  <cust_state>${Cust_state}</cust_state>
		  <cust_country>${Cust_country}</cust_country>
		  <cust_addr>${Cust_addr}</cust_addr>
		  <cust_companyid>${Cust_companyid}</cust_companyid>
		  <cust_vat>${Cust_vat}</cust_vat>
		  <cust_fax>${Cust_fax}</cust_fax>
	   </upd:MT_PUPDATE_REQ>
	</soapenv:Body>
 </soapenv:Envelope>`;

 console.log(postData);
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res1.on("end", function (chunk) {
			
			const body = Buffer.concat(chunks);
			// console.log(body);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			console.log('line 237',data);
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_PUPDATE_RES'];
			console.log('line 237',resp);
			
			console.log('abc',resp);
			res.send({
				status: resp['status']['_text'],
				// status: "1 ",
			})
		});

		res1.on("error", function (error) {
			console.error(error);
			
		});
	});

	req1.write(postData);

	req1.end();
});

//displaying the 1..1 Invoice data from SAP Ztable ZTA_INVOICE


app.post('/invoice',async (req, res) => {
	const custUsername = req.body.custID
	const saleorderid = req.body.saleorderid
	const time = req.body.time

const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_INVOICE2>
	  <!--You may enter the following 4 items in any order-->
	  <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
  
	  <SALEORDER_ID>${saleorderid}</SALEORDER_ID>
	
	  <TIME>${time}</TIME>
	  <INVOICE_TABLE>
		 <item>
			
		 </item>
	  </INVOICE_TABLE>
   </urn:BAPI_INVOICE2>
</soapenv:Body>
</soapenv:Envelope>`;
console.log('xmlbody',xmlBody)
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaInvoice&receiverParty=&receiverService=&interface=SI_INVOICE2&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_INVOICE2.Response']['INVOICE_TABLE']['item']
	console.log(1e9+7, resp)
	res.send(
		{
			KUNNR : resp['KUNNR']['_text'],
			VBELN : resp['VBELN']['_text'],
			AUART : resp['AUART']['_text'],
			BUKRS_VF : resp['BUKRS_VF']['_text'],
			VKORG : resp['VKORG']['_text'],
			VTWEG : resp['VTWEG']['_text'],
			FKDAT : resp['FKDAT']['_text'],
			ERZET : resp['ERZET']['_text'],
			ERDAT : resp['ERDAT']['_text'],
			WAERK : resp['WAERK']['_text'],
			NETWR : resp['NETWR']['_text'],
	});

})

//displaying the Invoice data from SAP Ztable ZTA_INVOICE


app.post('/customerinvoice',async (req, res) => {
	const custUsername = req.body.custID
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
	<urn:BAPI_INVOICE>

		<CUSTOMER_ID>
		
			<CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
		</CUSTOMER_ID>
		<INVOICE_TABLE>
	<item>
			</item>
		</INVOICE_TABLE>
	</urn:BAPI_INVOICE>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaInvoice&receiverParty=&receiverService=&interface=SI_INVOICE&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	invoiceresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_INVOICE.Response']['INVOICE_TABLE']['item']
	console.log(1e9+7, invoiceresponse)
	res.send(
		{
				invoiceresponse: invoiceresponse
	});

})

//credit memo displayed from Ztable ZCREDITMEMO
app.post('/credit', async (req, res) => {
	const custUsername = req.body.custID
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_CREDIT>

	  <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
	  <CREDIT_TABLE>
		
		 <item>
			
		 </item>
	  </CREDIT_TABLE>
   </urn:BAPI_CREDIT>
</soapenv:Body>
</soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaCredit&receiverParty=&receiverService=&interface=SI_CREDIT&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	creditresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_CREDIT.Response']['CREDIT_TABLE']['item']
	console.log(1e9+7, creditresponse)
	res.send(
		{
				creditresponse: creditresponse
	});

})



//displaying the Payment and Aging details

app.post('/payment', async (req, res) => {
	
	const custUsername = req.body.custID
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_PAYMENT>
	  <!--You may enter the following 2 items in any order-->
	  	  <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
	  <PAYMENT_TABLE>
		 <!--Zero or more repetitions:-->
		 <item>
			
		 </item>
	  </PAYMENT_TABLE>
   </urn:BAPI_PAYMENT>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Customerportal&receiverParty=&receiverService=&interface=SI_PAYMENT&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	paymentresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PAYMENT.Response']['PAYMENT_TABLE']['item']
	console.log(1e9+7, paymentresponse)
	res.send(
		{
				paymentresponse: paymentresponse
	});

})
//displaying the Inquiry details


app.post('/inquiry', async (req, res) => {
	
	const custUsername = req.body.custID
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_INQUIRY>
	  <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
	
	  <INQUIRY_TABLE>
	 
		 <item>
		   
		 </item>
	  </INQUIRY_TABLE>
   </urn:BAPI_INQUIRY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaInquiry&receiverParty=&receiverService=&interface=SI_INQUIRY&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	inquiryresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_INQUIRY.Response']['INQUIRY_TABLE']['item']
	console.log(1e9+7, inquiryresponse)
	res.send(
		{
				inquiryresponse: inquiryresponse
	});

})

//displaying the Delivery details


app.post('/delivery', async (req, res) => {
	
	const custUsername = req.body.custID
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_DELIVERY>
	  <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
	  <VSTEL>SA01</VSTEL>
	  <DELIVERY_TABLE>
		 <item>   
		 </item>
	  </DELIVERY_TABLE>
   </urn:BAPI_DELIVERY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaDelivery&receiverParty=&receiverService=&interface=SI_DELIVERY&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	deliveryresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_DELIVERY.Response']['DELIVERY_TABLE']['item']
	console.log(1e9+7, deliveryresponse)
	res.send(
		{
				deliveryresponse: deliveryresponse
	});

})


//displaying the Saleorder details from SAP Ztable Zcustomer_sales


app.post('/saleorder', async (req, res) => {
	
	const custUsername = req.body.custID
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_SALEORDER>

	  <CUSTOMER_ID>
	  
		 <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
	  </CUSTOMER_ID>
	  <SALE_TABLE>
		
		 <item>
		 </item>
	  </SALE_TABLE>
   </urn:BAPI_SALEORDER>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaCustomer&receiverParty=&receiverService=&interface=SI_SALEORDER&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	saleresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_SALEORDER.Response']['SALE_TABLE']['item']
	console.log(1e9+7, saleresponse)
	res.send(
		{
				saleresponse: saleresponse
	});

})


//displaying the overallsales details


app.post('/overallsales', async (req, res) => {
	
	const custUsername = req.body.custID
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_OVERALLSALES>
	  <!--You may enter the following 2 items in any order-->
	  <CUSTOMER_ID>${custUsername}</CUSTOMER_ID>
	  <SALES_TABLE>
		 <!--Zero or more repetitions:-->
		 <item>
		  
		 </item>
	  </SALES_TABLE>
   </urn:BAPI_OVERALLSALES>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Customerportal&receiverParty=&receiverService=&interface=SI_Overallsales&interfaceNamespace=http://sivaprakash.com/customer',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	overallresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_OVERALLSALES.Response']['SALES_TABLE']['item']
	console.log(1e9+7, overallresponse)
	res.send(
		{
				overallresponse: overallresponse
	});

})

//---------------------------------END OF CUSTOMER PORTAL--------------------------------//



//--------------------------------------VENDOR PORTAL------------------------------------//
//Validating the credentials data from SAP Ztable ZTA_VEN_AUTH
//Function Module : ZFM_AUTH_VEN
//PO done by Siva
//Ztable made Siva

app.post('/Vendorlogin', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VLogin&receiverParty=&receiverService=&interface=SI_OUT_VLogin_req&interfaceNamespace=http://crimson-fern.com/vendor',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	
	
	const Ven_username = req.body.email;
	const Ven_password = req.body.password;
	console.log(Ven_username);
	console.log(Ven_password);
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ven="http://crimson-fern.com/vendor">
	<soapenv:Header/>
	<soapenv:Body>
	   <ven:MT_VLogin_req>
		  <Username>${Ven_username}</Username>
		  <Password>${Ven_password}</Password>
	   </ven:MT_VLogin_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];
		
		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_VLogin_res'];
			console.log(resp);
			let token;
			
			if(resp['Status']['_text']==='1 '){
				// login sucess
				token = jwt.sign({
                    id:'1613',
                    email: 'Vendor@gmail.com'
                }, 'siva', {
                    expiresIn: 604800
                });
			} else {
				token = null;
			}

			res.send({
				Status: resp['Status']['_text'],
				token: token,
				username: req.body.email
			});
		});

		res1.on("error", function (error) {
			console.error('probably SAP is not working',error);
			
		});
	});

	req1.write(postData);

	req1.end();
});

//displaying the Vendor profile data from SAP Ztable ZTA_VEN_PROFILE
//PO done by Siva
//Ztable made by Siva

app.post('/vendorprofile', async (req, res) => {
	const Ven_username = req.body.venID;
	
	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_VENDORPROFILE>
		  
		  <VENDOR_ID>${Ven_username}</VENDOR_ID>
		  <VENDOR_TABLE>
			 
			 <item>
			  </item>
		  </VENDOR_TABLE>
	   </urn:BAPI_VENDORPROFILE>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaVendorProfile&receiverParty=&receiverService=&interface=SI_PROFILE_REQ&interfaceNamespace=http://sivaprakash.com/vendor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_VENDORPROFILE.Response']['VENDOR_TABLE']['item']
	console.log(1e9+7, resp)
	res.send(
		{
				ven_name: resp['NAME1']['_text'],
				ven_email: resp['LIFNR']['_text'],
				ven_phone: resp['LIFNR']['_text'],
				ven_city: resp['ORT01']['_text'],
				ven_country: resp['LAND1']['_text'],
				ven_pincode: resp['PSTLZ']['_text'],
				ven_state: resp['REGIO']['_text'],
				ven_address: resp['STRAS']['_text'],

				ven_pan: resp['LIFNR']['_text'],
				ven_gstin: resp['LIFNR']['_text'],
				ven_entitytype: resp['LIFNR']['_text'],
				ven_regtype: resp['LIFNR']['_text']
		});

})
//Updating the Vendor profile data from SAP Ztable ZTA_VEN_PROFILE
//PO & Function module done by SIVA
//FM_UPDATE_VPROFILE
//Ztable made by SIVA

// app.post('/updatevendorprofile', (req, res) => {
// 	const Ven_username = req.body.venID;
	
// 	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
// 	<soapenv:Header/>
// 	<soapenv:Body>
// 	   <urn:BAPI_VENUPDATEPROFILE>
// 		  <LAND1>${a}</LAND1>
// 		  <LIFNR>${a}</LIFNR>
// 		  <NAME1>${a}</NAME1>
// 		  <ORT01>${a}</ORT01>
// 		  <PSTLZ>${a}</PSTLZ>
// 		  <REGIO>${a}</REGIO>
// 		  <STRAS>${a}</STRAS>
// 	   </urn:BAPI_VENUPDATEPROFILE>
// 	</soapenv:Body>
//  </soapenv:Envelope>`;
// 	const result = await axios.post('http://dxktpipo.kaarclou.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_VendorUpdate&receiverParty=&receiverService=&interface=SI_VENDOR_UPDATE_PROFILE&interfaceNamespace=http://sivaprakash.com/vendor',
// 		xmlBody, {
// 			headers
// 		}
// 	).then((response) => {
// 		return response.data
// 	}). catch((error) => {
// 		console.error(1e7+9)
// 		return error
// 	})
// 	let data = parser.xml2json(result, { compact: true, spaces: 2 })
// 	resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_VENDORPROFILE.Response']['VENDOR_TABLE']['item']
// 	console.log(1e9+7, resp)
// 	res.send(
// 		{
// 				ven_name: resp['NAME1']['_text'],
// 				ven_email: resp['LIFNR']['_text'],
// 				ven_phone: resp['LIFNR']['_text'],
// 				ven_city: resp['ORT01']['_text'],
// 				ven_country: resp['LAND1']['_text'],
// 				ven_pincode: resp['PSTLZ']['_text'],
// 				ven_state: resp['REGIO']['_text'],
// 				ven_address: resp['STRAS']['_text'],

// 				ven_pan: resp['LIFNR']['_text'],
// 				ven_gstin: resp['LIFNR']['_text'],
// 				ven_entitytype: resp['LIFNR']['_text'],
// 				ven_regtype: resp['LIFNR']['_text']
// 		});

// })

//displaying the Quotation details from SAP Ztable ZINQUIRY


app.post('/quotation', async (req, res) => {

const Ven_username = req.body.venID;
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_QUOTATION>
	  <VENDOR_ID>${Ven_username}</VENDOR_ID>
	  <QUOTATION_TABLE>
		 
		 <item>
			
		 </item>
	  </QUOTATION_TABLE>
   </urn:BAPI_QUOTATION>
</soapenv:Body>
</soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaVendorQuotation&receiverParty=&receiverService=&interface=SI_QUOTATION&interfaceNamespace=http://sivaprakash.com/vendor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	quotationresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_QUOTATION.Response']['QUOTATION_TABLE']['item']
	console.log(1e9+7, quotationresponse)
	res.send(
		{
				quotationresponse: quotationresponse
	});

})


//displaying the 1..1 Quotation data from SAP Ztable ZTA_INVOICE


app.post('/quotation2',async (req, res) => {

	const Ven_username = req.body.venID;
	const EBELN = req.body.EBELN;


const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_QUOTATION2>
	  <EBELN>${EBELN}</EBELN>
	  <VENDOR_ID>${Ven_username}</VENDOR_ID>
	  <QUOTATION_TABLE>
		
		 <item>
			
		 </item>
	  </QUOTATION_TABLE>
   </urn:BAPI_QUOTATION2>
</soapenv:Body>
</soapenv:Envelope>`;
console.log('xmlbody',xmlBody)
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaVendorQuotation&receiverParty=&receiverService=&interface=SI_QUOTATION2&interfaceNamespace=http://sivaprakash.com/vendor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_QUOTATION2.Response']['QUOTATION_TABLE']['item']
	console.log(1e9+7, resp)
	res.send(
		{
			EBELN : resp['EBELN']['_text'],
			EBELP : resp['EBELP']['_text'],
			BUKRS : resp['BUKRS']['_text'],
			BSTYP : resp['BSTYP']['_text'],
			BSART : resp['BSART']['_text'],
			STATU : resp['STATU']['_text'],
			LIFNR : resp['LIFNR']['_text'],
			NAME1 : resp['NAME1']['_text'],
			AEDAT : resp['AEDAT']['_text'],
			EKORG : resp['EKORG']['_text'],
			EKGRP : resp['EKGRP']['_text'],
			
	});

})


//credit memo for vendor
app.post('/creditvendor', async (req, res) => {
	
	const Ven_username = req.body.venID;
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_VENCREDIT>
	  <!--You may enter the following 2 items in any order-->
	  <VENDOR_ID>${Ven_username}</VENDOR_ID>
	  <CREDIT_TABLE>
		 
		 <item>
		   
		 </item>
	  </CREDIT_TABLE>
   </urn:BAPI_VENCREDIT>
</soapenv:Body>
</soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaVendorCredit&receiverParty=&receiverService=&interface=SI_CREDIT&interfaceNamespace=http://sivaprakash.com/vendor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	vendorcredit = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_VENCREDIT.Response']['CREDIT_TABLE']['item']
	console.log(1e9+7, vendorcredit)
	res.send(
		{
				vendorcredit: vendorcredit
	});

})

//Purchase order display from table ZTA_PURCHASE
//PO done by Siva
//Ztable made JK

app.post('/purchaseorder1', async (req, res) => {
	
	const Ven_username = req.body.venID;
	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_VENINVOICE>
 
	  <VENDOR_ID>${Ven_username}</VENDOR_ID>
	  <INVOICE_TABLE>
	
		 <item>
		  
		 </item>
	  </INVOICE_TABLE>
   </urn:BAPI_VENINVOICE>
</soapenv:Body>
</soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaVendorInvoice&receiverParty=&receiverService=&interface=SI_INVOICE&interfaceNamespace=http://sivaprakash.com/vendor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	saledisplay = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_VENINVOICE.Response']['INVOICE_TABLE']['item']
	console.log(1e9+7, saledisplay)
	res.send(
		{
				saledisplay: saledisplay
	});

})

//Goods receipt display from table ZTA_GOODS
//PO done by Siva
//Ztable made JK

app.post('/goodsreciept', async (req, res) => {
	const Ven_username = req.body.venID;
	
	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_GOODS>
		  <!--You may enter the following 2 items in any order-->
		  <VENDOR_ID>${Ven_username}</VENDOR_ID>
		  <GOODS_TABLE>
			 
			 <item>
				
			 </item>
		  </GOODS_TABLE>
	   </urn:BAPI_GOODS>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_SivaVendorGoods&receiverParty=&receiverService=&interface=SI_GOODS&interfaceNamespace=http://sivaprakash.com/vendor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	goodsdisplay = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_GOODS.Response']['GOODS_TABLE']['item']
	console.log(1e9+7, goodsdisplay)
	res.send(
		{
			goodsdisplay: goodsdisplay
		});

})
	
//-------------------------------------END OF VENDOR PORTAL-----------------------------------//


//--------------------------------------Employee PORTAL------------------------------------//


//Validating the credentials data from SAP Ztable ZTA_MTN_AUTH
//PO done by Siva
//Ztable made Siva

app.post('/Employeelogin', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EmployeePortal&receiverParty=&receiverService=&interface=SI_OUT_ELogin_req&interfaceNamespace=http://crimson-fern.com/employee',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	
	
	const Emp_username = req.body.email;
	const Emp_password = req.body.password;
	console.log(Emp_username);
	console.log(Emp_password);
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:emp="http://crimson-fern.com/employee">
	<soapenv:Header/>
	<soapenv:Body>
	   <emp:MT_ELogin_req>
		  <Username>${Emp_username}</Username>
		  <Password>${Emp_password}</Password>
	   </emp:MT_ELogin_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];
		
		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			console.log("trial5",xml);
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_ELogin_res'];
			console.log(resp);
			let token;
			if(resp['Status']['_text']==='1 '){
				// login sucess
				token = jwt.sign({
                    id:'1633',
                    email: 'Employee@gmail.com'
                }, 'siva', {
                    expiresIn: 604800
                });
			} else {
				token = null;
			}
			res.send({
				Status: resp['Status']['_text'],
				token: token,
				username: req.body.email
			});
			
		});

		res1.on("error", function (error) {
			console.error('probably SAP is not working',error);
			
		});
	});

	req1.write(postData);

	req1.end();
});


//displaying the Employeeprofile data from SAP Ztable ZTA_Emp_PROFILE
//PO done by Siva
//Ztable made by Siva

app.post('/employeeprofile', (req, res) => {
	console.log('received token is : ', req.headers.token);

	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EmployeePortal&receiverParty=&receiverService=&interface=SI_OUT_EProfile_req&interfaceNamespace=http://crimson-fern.com/employee',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const EmpID = req.body.EmpID;
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:emp="http://crimson-fern.com/employee">
	<soapenv:Header/>
	<soapenv:Body>
	   <emp:MT_EProfile_req>
		  <Username>${EmpID}</Username>
	   </emp:MT_EProfile_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_EProfile_res'];
			
			res.send({
				emp_name: resp['emp_name']['_text'],
				emp_phone: resp['emp_phone']['_text'],
				emp_city: resp['emp_city']['_text'],
				emp_state: resp['emp_state']['_text'],
				emp_address: resp['emp_address']['_text'],
				emp_country: resp['emp_country']['_text'],
				emp_pincode: resp['emp_pincode']['_text'],
				emp_email: resp['emp_email']['_text'],
				emp_fax: resp['emp_fax']['_text'],
				emp_company: resp['emp_company']['_text'],
				emp_department: resp['emp_department']['_text'],
				emp_jobrole: resp['emp_jobrole']['_text'],
				emp_reportsto: resp['emp_reportsto']['_text'],
				emp_hiredate: resp['emp_hiredate']['_text'],
			});
		});

		res1.on("error", function (error) {
			console.error(error);
		});
	});

	req1.write(postData);

	req1.end();
});


//Updatating the Employeeprofile data from SAP Ztable ZTA_EMP_PROFILE
//PO done by Siva
//Ztable made by Siva

app.post('/employeeupdate', (req, res) => {
	console.log('received token is : ', req.headers.token);

	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_EmployeePortal&receiverParty=&receiverService=&interface=SI_OUT_EUpdate_req&interfaceNamespace=http://crimson-fern.com/employee',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const emp_id = req.body.empID;
	const emp_name = req.body.Name;
	const emp_email = req.body.Email;
	const emp_phone = req.body.Phone;
	const emp_city = req.body.City;
	const emp_country = req.body.Country;
	const emp_pincode = req.body.Pincode;
	const emp_state = req.body.State;
	const emp_address = req.body.Address;
	const emp_fax = req.body.FAX;
	const emp_company = req.body.Company;	
	const emp_department = req.body.Department;
	const emp_jobrole = req.body.Jobrole;
	const emp_reportsto = req.body.Reportsto;
	const emp_hiredate = req.body.Hiredate;
	
	const postData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:emp="http://crimson-fern.com/employee">
	<soapenv:Header/>
	<soapenv:Body>
	   <emp:MT_EUpdate_req>
		  <emp_id>${emp_id}</emp_id>	   
		  <emp_name>${emp_name}</emp_name>
		  <emp_phone>${emp_phone}</emp_phone>
		  <emp_city>${emp_city}</emp_city>
		  <emp_state>${emp_state}</emp_state>
		  <emp_address>${emp_address}</emp_address>
		  <emp_country>${emp_country}</emp_country>
		  <emp_pincode>${emp_pincode}</emp_pincode>
		  <emp_email>${emp_email}</emp_email>
		  <emp_fax>${emp_fax}</emp_fax>
		  <emp_company>${emp_company}</emp_company>
		  <emp_department>${emp_department}</emp_department>
		  <emp_jobrole>${emp_jobrole}</emp_jobrole>
		  <emp_reportsto>${emp_reportsto}</emp_reportsto>
		  <emp_hiredate>${emp_hiredate}</emp_hiredate>
	   </emp:MT_EUpdate_req>
		 </soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res1.on("end", function (chunk) {
			
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			console.log(xml);
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_EUpdate_res'];
			res.send({
				Status: resp['Status']['_text'],
				
			})
			console.log("status response is:",resp['Status']['_text']);
		});

		res1.on("error", function (error) {
			console.error(error);
			
		});
	});

	req1.write(postData);

	req1.end();
});


//Creating Employee leave request ZTA_Leave
//PO done by Siva
//Ztable made by Siva

app.post('/employeeleaverequest', (req, res) => {
	console.log('received token is : ', req.headers.token);

	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_TA_EMPLOYEE&receiverParty=&receiverService=&interface=SI_CREATELR_REQ&interfaceNamespace=http://crimson-fern.com/employee',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const emp_id = req.body.empID;
	const leave_id = req.body.leaveID;
	const emp_name = req.body.name;
	const emp_department = req.body.department;
	const leavetype = req.body.leavetype;
	const emailto = req.body.emailto;
	const date_from = req.body.date_from;
	const date_to = req.body.date_to;
	const reason = req.body.reason;
	

	
	const postData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:emp="http://crimson-fern.com/employee">
	<soapenv:Header/>
	<soapenv:Body><emp:MT_CREATELR_REQ>
		  <EMP_ID>${emp_id}</EMP_ID>
		  <LEAVE_ID>${leave_id}</LEAVE_ID>
		  <EMP_NAME>${emp_name}</EMP_NAME>
		  <EMP_DEPT>${emp_department}</EMP_DEPT>
		  <LEAVE_TYPE>${leavetype}</LEAVE_TYPE>
		  <EMAIL_TO>${emailto}</EMAIL_TO>
		  <DATE_FROM>${date_from}</DATE_FROM>
		  <DATE_TO>${date_to}</DATE_TO>
		  <REASON>${reason}</REASON>
	   </emp:MT_CREATELR_REQ>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res1.on("end", function (chunk) {
			
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			console.log(xml);
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_CREATELR_RES'];
			res.send({
				Status: resp['STATUS_CODE']['_text'],
				
			})
			console.log("status response is:",resp['STATUS_CODE']['_text']);
		});

		res1.on("error", function (error) {
			console.error(error);
			
		});
	});

	req1.write(postData);

	req1.end();
});

//displaying the Leave requests of employee from SAP ZTA_LEAVE
//PO done by Divya and Atachaya
//Ztable made by Siva

app.post('/employeeleavedisplay', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_TA_EMPLOYEE&receiverParty=&receiverService=&interface=SI_DISPLAYLR_REQ&interfaceNamespace=http://crimson-fern.com/employee',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const emp_id = req.body.EmpID;
	console.log(emp_id);
	
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:emp="http://crimson-fern.com/employee">
	<soapenv:Header/>
	<soapenv:Body>
	   <emp:MT_DISPLAYLR_REQ>
		  <EMP_ID>${emp_id}</EMP_ID>
	   </emp:MT_DISPLAYLR_REQ>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			console.log('recieved from Soap',data);
			const resp = JSON.parse(data)['SOAP:Envelope'];
			var leaveresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_DISPLAYLR_RES']['DISPLAYLR'];
			console.log(leaveresponse);
			for(i in leaveresponse)
			{
				console.log(leaveresponse[i].LEAVE_ID);
				console.log(leaveresponse[i].EMP_ID);
				console.log(leaveresponse[i].EMP_NAME);
				console.log(leaveresponse[i].EMP_DEPT);
				console.log(leaveresponse[i].LEAVE_TYPE);
				console.log(leaveresponse[i].EMAIL_TO);
				console.log(leaveresponse[i].DATE_FROM);
				console.log(leaveresponse[i].DATE_TO);
				console.log(leaveresponse[i].REASON);
			}
			
			res.send({
				leaveresponse: leaveresponse
			});
		});

		res1.on("error", function (error) {
			console.error(error);
			
		});
	});

	req1.write(postData);

	req1.end();
});


//displaying the Salary Display of employee from SAP ZTA_SALARY
//PO done by Divya and Atachaya
//Ztable made by Siva

app.post('/employeepayslip', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_TA_EMPLOYEE&receiverParty=&receiverService=&interface=SI_SALARYPAYSLIP_REQ&interfaceNamespace=http://crimson-fern.com/employee',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const emp_id = req.body.EmpID;
	const Year = req.body.year;
	console.log(emp_id);
	
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:emp="http://crimson-fern.com/employee">
	<soapenv:Header/>
	<soapenv:Body>
	   <emp:MT_SALARYPAYSLIP_REQ>
		  <EMP_ID>${emp_id}</EMP_ID>
		  <YEAR>${Year}</YEAR>
	   </emp:MT_SALARYPAYSLIP_REQ>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			console.log('recieved from Soap',data);
			const resp = JSON.parse(data)['SOAP:Envelope'];
			var salaryresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_SALARYPAYSLIP_RES']['SALARYPAYSLIP'];
			console.log(salaryresponse);
			for(i in salaryresponse)
			{
				console.log(salaryresponse[i].COMPANY_NAME);
				console.log(salaryresponse[i].EMP_ID);
				console.log(salaryresponse[i].EMP_NAME);
				console.log(salaryresponse[i].EMP_DEPT);
				console.log(salaryresponse[i].ACCOUNT_NUMBER);
				console.log(salaryresponse[i].MODE_OF_PARTY);
				console.log(salaryresponse[i].BASIC);
				console.log(salaryresponse[i].DA);
				console.log(salaryresponse[i].HRA);
				console.log(salaryresponse[i].NET_PAY);
				console.log(salaryresponse[i].MONTH);
				console.log(salaryresponse[i].YEAR);
			}
			
			res.send({
				salaryresponse: salaryresponse
			});
		});

		res1.on("error", function (error) {
			console.error(error);
			
		});
	});

	req1.write(postData);

	req1.end();
});

//displaying the Month and year wise Salary Details of employee from SAP ZTA_SALARY
//PO done by Divya and Atachaya
//Consumed by JK and Siva

app.post('/payslipfilter', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_TA_EMPLOYEE&receiverParty=&receiverService=&interface=SI_SALARYPAYSLIP_REQ&interfaceNamespace=http://crimson-fern.com/employee',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const emp_id = req.body.EmpID;
	const Month = req.body.month;
	const Year = req.body.year;
	console.log(emp_id);
	
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:emp="http://crimson-fern.com/employee">
	<soapenv:Header/>
	<soapenv:Body>
	   <emp:MT_SALARYPAYSLIP_REQ>
		  <EMP_ID>${emp_id}</EMP_ID>
		  <MONTH>${Month}</MONTH>
		  <YEAR>${Year}</YEAR>
	   </emp:MT_SALARYPAYSLIP_REQ>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			console.log('recieved from Soap',data);
			const resp = JSON.parse(data)['SOAP:Envelope'];
			console.log('Parsing data: ',resp);
			var monthresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_SALARYPAYSLIP_RES']['SALARYPAYSLIP'];
			console.log("final parsing: ",monthresponse);
			res.send({
				COMPANY_NAME: monthresponse['COMPANY_NAME']['_text'],
				EMP_ID:  monthresponse['EMP_ID']['_text'],
				EMP_NAME:  monthresponse['EMP_NAME']['_text'],
				EMP_DEPT:  monthresponse['EMP_DEPT']['_text'],
				ACCOUNT_NUMBER:  monthresponse['ACCOUNT_NUMBER']['_text'],
				MODE_OF_PARTY:  monthresponse['MODE_OF_PARTY']['_text'],
				BASIC:  monthresponse['BASIC']['_text'],
				DA:  monthresponse['DA']['_text'],
				HRA:  monthresponse['HRA']['_text'],
				NET_PAY:  monthresponse['NET_PAY']['_text'],
				MONTH:  monthresponse['MONTH']['_text'],
				YEAR:  monthresponse['YEAR']['_text'],

			});
		});

		res1.on("error", function (error) {
			console.error(error);
			
		});
	});

	req1.write(postData);

	req1.end();
});




//--------------------------------END OF Employee PORTAL------------------------------//




//--------------------------------------MAINTENANCE PORTAL------------------------------------//


//Validating the credentials data from SAP Ztable ZTA_MTN_AUTH
//PO done by Siva
//Ztable made Siva

app.post('/Maintenancelogin', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MLogin&receiverParty=&receiverService=&interface=SI_OUT_MLogin_req&interfaceNamespace=http://crimson-fern.com/maintenance',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	
	
	const Mtn_username = req.body.email;
	const Mtn_password = req.body.password;
	console.log(Mtn_username);
	console.log(Mtn_password);
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:main="http://crimson-fern.com/maintenance">
	<soapenv:Header/>
	<soapenv:Body>
	   <main:MT_MLogin_req>
		  <Username>${Mtn_username}</Username>
		  <Password>${Mtn_password}</Password>
	   </main:MT_MLogin_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];
		
		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			console.log("trial5",xml);
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_MLogin_res'];
			console.log(resp);
			let token;
			if(resp['Status']['_text']==='1 '){
				// login sucess
				token = jwt.sign({
                    id:'1632',
                    email: 'maintenance@gmail.com'
                }, 'siva', {
                    expiresIn: 604800
                });
			} else {
				token = null;
			}
			res.send({
				Status: resp['Status']['_text'],
				token: token,
				username: req.body.email
			});
			
		});

		res1.on("error", function (error) {
			console.error('probably SAP is not working',error);
			
		});
	});

	req1.write(postData);

	req1.end();
});


//displaying the maintenanceprofile data from SAP Ztable ZTA_CUST_maintenancePROFILE
//PO done by Siva
//Ztable made by Siva

app.post('/maintenanceprofile', (req, res) => {
	console.log('received token is : ', req.headers.token);

	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MLogin&receiverParty=&receiverService=&interface=SI_OUT_MProfile_req&interfaceNamespace=http://crimson-fern.com/maintenance',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const MtnID = req.body.mtnID;
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:main="http://crimson-fern.com/maintenance">
	<soapenv:Header/>
	<soapenv:Body>
	   <main:MT_MProfile_req>
		  <Username>${MtnID}</Username>
	   </main:MT_MProfile_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_MProfile_res'];
			res.send({
				name: resp['Name']['_text'],
				email: resp['Email']['_text'],
				phone: resp['PhoneNo']['_text'],
			});
		});

		res1.on("error", function (error) {
			console.error(error);
		});
	});

	req1.write(postData);

	req1.end();
});

//Workorder display 


app.post('/workorderdisp', async (req, res) => {
	const PlantName = req.body.plantID

const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_WORKORDERDISPLAY>

	  <IWERK>${PlantName}</IWERK>
	  <WORKORDER_TABLE>
		   <item>
		   
		 </item>
	  </WORKORDER_TABLE>
   </urn:BAPI_WORKORDERDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Maintenanceportal&receiverParty=&receiverService=&interface=SI_OUT_Workorderdisplay_req&interfaceNamespace=http://sivaprakash.com/maintenance',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	workorderresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_WORKORDERDISPLAY.Response']['WORKORDER_TABLE']['item']
	console.log(1e9+7, workorderresponse)
	res.send(
		{
				workorderresponse: workorderresponse
	});

})
 
//workorder disp2 1..1
app.post('/workorderdisp2',async (req, res) => {
	const PlantName = req.body.plantID
	const OrderID = req.body.orderID

const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_WORKORDERDISPLAY>
	  <AUFNR>${OrderID}</AUFNR>
	  <IWERK>${PlantName}</IWERK>
	  <WORKORDER_TABLE>
   
		 <item>
		 
		 </item>
	  </WORKORDER_TABLE>
   </urn:BAPI_WORKORDERDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Maintenanceportal&receiverParty=&receiverService=&interface=SI_OUT_Workorderdisplay_req&interfaceNamespace=http://sivaprakash.com/maintenance',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	workorderresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_WORKORDERDISPLAY.Response']['WORKORDER_TABLE']['item']
	console.log(1e9+7, workorderresponse)
	res.send(

			{
				AUFNR: workorderresponse['AUFNR']['_text'],
				ARTPR:  workorderresponse['ARTPR']['_text'],
				PRIOK:  workorderresponse['PRIOK']['_text'],
				EQUNR:  workorderresponse['EQUNR']['_text'],
				ILOAN:  workorderresponse['ILOAN']['_text'],
				IWERK:  workorderresponse['IWERK']['_text'],
				INGPR:  workorderresponse['INGPR']['_text'],
				GEWRK:  workorderresponse['GEWRK']['_text'],
				OBKNR: workorderresponse['OBKNR']['_text'],
				ADDAT:  workorderresponse['ADDAT']['_text'],
				ADUHR:  workorderresponse['ADUHR']['_text'],
				PLNUM:  workorderresponse['PLNUM']['_text'],
				STRMP:  workorderresponse['STRMP']['_text'],
				ETRMP:  workorderresponse['ETRMP']['_text'],
				PSMNG:  workorderresponse['PSMNG']['_text'],
				AMEIN:  workorderresponse['AMEIN']['_text'],
				MEINS: workorderresponse['MEINS']['_text'],
				MATNR:  workorderresponse['MATNR']['_text'],
				PWERK:  workorderresponse['PWERK']['_text'],
				DGLTP:  workorderresponse['DGLTP']['_text'],
				DGLTS:  workorderresponse['DGLTS']['_text'],
			
			
		});

	})

// Workorder creation from table ZMAINTENANCE_TAB
app.post('/workordercreate', async (req, res) => {
	console.log("/workordercreate is called")
              
	const ARTPR = req.body.ARTPR                  
	const PRIOK = req.body.PRIOK                  
	const EQUNR = req.body.EQUNR                                                                 
	const ILOAN = req.body.ILOAN                  
	const IWERK = req.body.IWERK                  
	const INGPR = req.body.INGPR                  
	const GEWRK = req.body.GEWRK                  
	const OBKNR = req.body.OBKNR                  
	const ADDAT = req.body.ADDAT                  
	const ADUHR = req.body.ADUHR                               
	const PSMNG = req.body.PSMNG                             
	const MEINS = req.body.MEINS                  
	const MATNR = req.body.MATNR 
	const QMNUM = req.body.QMNUM                                     
              
	

	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_WORKORDERCREATE>
		 
		  <ADDAT>${ADDAT}</ADDAT>
		  <ADUHR>${ADUHR}</ADUHR>
		  <AMEIN>${MEINS}</AMEIN>
		  <ARTPR>${ARTPR}</ARTPR>
		  <AUFNR>12345</AUFNR>
		  <AUTYP>30</AUTYP>
		  <BESKZ>E</BESKZ>
		  <EQUNR>${EQUNR}</EQUNR>
		  <GEWRK>${GEWRK}</GEWRK>
		  <ILOAN>${ILOAN}</ILOAN>
		  <INGPR>${INGPR}</INGPR>
		  <IWERK>${IWERK}</IWERK>
		  <MATNR>${MATNR}</MATNR>
		  <MEINS>${MEINS}</MEINS>
		  <OBKNR>${OBKNR}</OBKNR>
		  <PRIOK>${PRIOK}</PRIOK>
		  <PSMNG>${PSMNG}</PSMNG>
		  <QMNUM>${QMNUM}</QMNUM>
		  <MESSAGE_TABLE>
		  
			 <item>
 
			 </item>
		  </MESSAGE_TABLE>
	   </urn:BAPI_WORKORDERCREATE>
	</soapenv:Body>
 </soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Maintenanceportal&receiverParty=&receiverService=&interface=SI_OUT_Workordercreate_req&interfaceNamespace=http://sivaprakash.com/maintenance',
		xmlBody, {
		headers
	}
	).then((response) => {
		return response.data
	}).catch((error) => {
		console.error(1e7 + 9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	// prodresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERCREATE.Response']['MESSAGE_TABLE']['item']
	messageresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_WORKORDERCREATE.Response']['RETURN']['MESSAGE']
	// console.log(prodresponse)
	console.log("messageresponse :",messageresponse)
	res.send(

		{
			// PUSER: prodresponse['PUSER']['_text'],
			Message : messageresponse,
		});

})



//notification display 


app.post('/notificationdisp', async (req, res) => {
	const ARTPR = req.body.ARTPR
	const QMART = req.body.QMART

const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_NOTIFICATIONDISPLAY>
	
	  <ARTPR>${ARTPR}</ARTPR>
	  <QMART>${QMART}</QMART>
	  <NOTIFICATION_TABLE>
		
		 <item>

		 </item>
	  </NOTIFICATION_TABLE>
   </urn:BAPI_NOTIFICATIONDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Maintenanceportal&receiverParty=&receiverService=&interface=SI_OUT_notifdisplay_req&interfaceNamespace=http://sivaprakash.com/maintenance',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	notifdisplay = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_NOTIFICATIONDISPLAY.Response']['NOTIFICATION_TABLE']['item']
	console.log(1e9+7, notifdisplay)
	res.send(
		{
				notifdisplay: notifdisplay
	});

})


//Notification create 


app.post('/notificationcreate',async (req, res) => {
	console.log('received token is : ', req.headers.token);
const QMTXT = req.body.QMTXT;
	const ARTPR = req.body.ARTPR;
	const ERDAT = req.body.ERDAT;
	const ERNAM = req.body.ERNAM;
	const MZEIT = req.body.MZEIT;
	const QMART = req.body.QMART;
	const QMDAT = req.body.QMDAT;
	const QMNAM = req.body.QMNAM;
	const QMNUM = 12345;
	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_NOTIFICATIONCREATE>
		  
		  <ARTPR>${ARTPR}</ARTPR>
		  <ERDAT>${ERDAT}</ERDAT>
		  <ERNAM>${ERNAM}</ERNAM>
		  <MZEIT>${MZEIT}</MZEIT>
		  <QMART>${QMART}</QMART>
		  <QMDAT>${QMDAT}</QMDAT>
		  <QMNAM>${QMNAM}</QMNAM>
		  <QMNUM>${QMNUM}</QMNUM>
		  <QMTXT>${QMTXT}</QMTXT>

		  <MESSAGE_TABLE>

			 <item>
			
			 </item>
		  </MESSAGE_TABLE>

	   </urn:BAPI_NOTIFICATIONCREATE>
	</soapenv:Body>
 </soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Maintenanceportal&receiverParty=&receiverService=&interface=SI_OUT_Notifcreate_req&interfaceNamespace=http://sivaprakash.com/maintenance',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	notificationresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_NOTIFICATIONCREATE.Response']['MESSAGE_TABLE']['item']
	messageresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_NOTIFICATIONCREATE.Response']['RETURN']['MESSAGE']
	console.log(notificationresponse)
	console.log(messageresponse)
	res.send(

			{
				QMNUM: notificationresponse['QMNUM']['_text'],
				Message: messageresponse,
			});

		})


//--------------------------------END OF MAINTENANCE PORTAL------------------------------//


//------------------------------------ SHOP FLOOR PORTAL---------------------------------//
//Validating the credentials data from SAP Ztable ZTA_MTN_AUTH
//PO done by Siva
//Ztable made Siva

app.post('/shopfloorlogin', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_MLogin&receiverParty=&receiverService=&interface=SI_OUT_MLogin_req&interfaceNamespace=http://crimson-fern.com/maintenance',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	
	
	const Shop_username = req.body.email;
	const Shop_password = req.body.password;
	console.log(Shop_username);
	console.log(Shop_password);
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:main="http://crimson-fern.com/maintenance">
	<soapenv:Header/>
	<soapenv:Body>
	   <main:MT_MLogin_req>
		  <Username>${Shop_username}</Username>
		  <Password>${Shop_password}</Password>
	   </main:MT_MLogin_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];
		
		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			console.log("trial5",xml);
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_MLogin_res'];
			console.log(resp);
			let token;
			if(resp['Status']['_text']==='1 '){
				// login sucess
				token = jwt.sign({
                    id:'1639',
                    email: 'Shop@gmail.com'
                }, 'siva', {
                    expiresIn: 604800
                });
			} else {
				token = null;
			}
			res.send({
				Status: resp['Status']['_text'],
				token: token,
				username: req.body.email
			});
			
		});

		res1.on("error", function (error) {
			console.error('probably SAP is not working',error);
			
		});
	});

	req1.write(postData);

	req1.end();
});


//planned order display 


app.post('/planneddisp', async (req, res) => {
	
	const PlantName = req.body.plantID

const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_PLANNEDORDERDISPLAY>
	  <!--You may enter the following 3 items in any order-->
	  <!--Optional:-->
	  
	  <PLWRK>${PlantName}</PLWRK>
	  <PLANNED_TABLE>
		 
		 <item>
		   
		 </item>
	  </PLANNED_TABLE>
   </urn:BAPI_PLANNEDORDERDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_ShopfloorPortal&receiverParty=&receiverService=&interface=SI_OUT_Plannedorderdisplay_req&interfaceNamespace=http://sivaprakash.com/shopfloor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	planneddisplay = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERDISPLAY.Response']['PLANNED_TABLE']['item']
	console.log(1e9+7, planneddisplay)
	res.send(
		{
				planneddisplay: planneddisplay
	});

})

//planned disp2 1..1
app.post('/planneddisp2',async (req, res) => {
	const PlantName = req.body.plantID
	const PlnumID = req.body.plnumID
	console.log("Plnum is ",PlnumID)
	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_PLANNEDORDERDISPLAY>
		  <!--You may enter the following 3 items in any order-->
		  <!--Optional:-->
		  <PLNUM>${PlnumID}</PLNUM>
 
		  <PLWRK>${PlantName}</PLWRK>
		  <PLANNED_TABLE>
			 <!--Zero or more repetitions:-->
			 <item>
			 
			 </item>
		  </PLANNED_TABLE>
	   </urn:BAPI_PLANNEDORDERDISPLAY>
	</soapenv:Body>
 </soapenv:Envelope>`;
		const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_ShopfloorPortal&receiverParty=&receiverService=&interface=SI_OUT_Plannedorderdisplay_req&interfaceNamespace=http://sivaprakash.com/shopfloor',
			xmlBody, {
				headers
			}
		).then((response) => {
			return response.data
		}). catch((error) => {
			console.error(1e7+9)
			return error
		})
		let data = parser.xml2json(result, { compact: true, spaces: 2 })
		resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERDISPLAY.Response']['PLANNED_TABLE']['item']
		console.log(1e9+7, resp)
		res.send(
			{
				PLNUM:  resp['PLNUM']['_text'],
				MATNR:  resp['MATNR']['_text'],
				PLWRK:  resp['PLWRK']['_text'],
				PWWRK:  resp['PWWRK']['_text'],
				PAART:  resp['PAART']['_text'],
				BESKZ:  resp['BESKZ']['_text'],
				SOBES:  resp['SOBES']['_text'],
				GSMNG: resp['GSMNG']['_text'],
				PSTTR:  resp['PSTTR']['_text'],
				PEDTR:  resp['PEDTR']['_text'],
				PERTR:  resp['PERTR']['_text'],
				DISPO:  resp['DISPO']['_text'],
				AUFNR:  resp['AUFNR']['_text'],
				PSTMP:  resp['PSTMP']['_text'],
				PUSER:  resp['PUSER']['_text'],
			
			});

		})

		//Planned order create 


app.post('/plannedcreate', async (req, res) => {
	console.log("/plannedcreate is called")
	
	const PLWRK = req.body.PLWRK;
	const PWWRK = req.body.PWWRK;
	const PAART = req.body.PAART;
	const MATNR = req.body.MATNR;
	const GSMNG = req.body.GSMNG;
	const PUSER = req.body.PUSER;
	const DISPO = req.body.DISPO;
	const BESKZ = req.body.BESKZ;
	const PSTMP = req.body.PSTMP;
	const PSTTR = req.body.PSTTR;
	const PEDTR = req.body.PEDTR;
	const PERTR = req.body.PERTR;
	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_PLANNEDORDERCREATE>
		  
		  <BESKZ>${BESKZ}</BESKZ>
		  <DISPO>${DISPO}</DISPO>
		  <GSMNG>${GSMNG}</GSMNG>
		  <MATNR>${MATNR}</MATNR>
		  <PAART>${PAART}</PAART>
		  <PEDTR>${PEDTR}</PEDTR>
		  <PERTR>${PERTR}</PERTR>
		  <PLNUM>12345</PLNUM>
		  <PLWRK>${PLWRK}</PLWRK>
		  <PSTMP>${PSTMP}</PSTMP>
		  <PSTTR>${PSTTR}</PSTTR>
		  <PUSER>${PUSER}</PUSER>
		  <PWWRK>${PWWRK}</PWWRK>
		  <SOBES>${BESKZ}</SOBES>
		  <MESSAGE_TABLE>
			 <item>
	   
			 </item>
		  </MESSAGE_TABLE>
	   </urn:BAPI_PLANNEDORDERCREATE>
	</soapenv:Body>
 </soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_ShopfloorPortal&receiverParty=&receiverService=&interface=SI_OUT_Plannedordercreate_req&interfaceNamespace=http://sivaprakash.com/shopfloor',
		xmlBody, {
		headers
	}
	).then((response) => {
		return response.data
	}).catch((error) => {
		console.error(1e7 + 9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	plannedresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERCREATE.Response']['MESSAGE_TABLE']['item']
	messageresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERCREATE.Response']['RETURN']['MESSAGE']
	console.log(plannedresponse)
	console.log("messageresponse :",messageresponse)
	res.send(

		{
			PUSER: plannedresponse['PUSER']['_text'],
			Message : messageresponse,

		});

})



//<<<<<<<<<<<< Production order >>>>>>>>>>>>>>>//

//Production order display 1..1



app.post('/productiondisp',async (req, res) => {
	
	const PlantName = req.body.plantID

const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_PRODORDERDISPLAY>
	  
	 
	  <PWERK>${PlantName}</PWERK>
	  <PROD_TABLE>
		 
		 <item>
		 
		
		 </item>
	  </PROD_TABLE>
   </urn:BAPI_PRODORDERDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_ShopfloorPortal&receiverParty=&receiverService=&interface=SI_OUT_Prodorderdisplay_req&interfaceNamespace=http://sivaprakash.com/shopfloor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	proddisplay = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PRODORDERDISPLAY.Response']['PROD_TABLE']['item']
	console.log(1e9+7, proddisplay)
	res.send(
		{
				proddisplay: proddisplay
	});

})



                                                

//prod disp2 1..1
app.post('/productiondisp2',async (req, res) => {
	const PlantName = req.body.plantID
	const OrderID = req.body.orderID

const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_PRODORDERDISPLAY>
	  <!--You may enter the following 4 items in any order-->
	  <!--Optional:-->
	  <AUFNR>${OrderID}</AUFNR>
	  <!--Optional:-->

	  <PWERK>${PlantName}</PWERK>
	  <PROD_TABLE>
		 <!--Zero or more repetitions:-->
		 <item>
	 
		 </item>
	  </PROD_TABLE>
   </urn:BAPI_PRODORDERDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;
	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_ShopfloorPortal&receiverParty=&receiverService=&interface=SI_OUT_Prodorderdisplay_req&interfaceNamespace=http://sivaprakash.com/shopfloor',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PRODORDERDISPLAY.Response']['PROD_TABLE']['item']
	console.log(1e9+7, resp)
	res.send(

			{
				
				AUFNR: resp['AUFNR']['_text'],
				POSNR:  resp['POSNR']['_text'],
				PSOBS:  resp['PSOBS']['_text'],
				PLNUM:  resp['PLNUM']['_text'],
				STRMP:  resp['STRMP']['_text'],
				ETRMP:  resp['ETRMP']['_text'],
				PSMNG:  resp['PSMNG']['_text'],
				MEINS: resp['MEINS']['_text'],
				MATNR:  resp['MATNR']['_text'],
				LTRMP:  resp['LTRMP']['_text'],
				WEPOS:  resp['WEPOS']['_text'],
				PWERK:  resp['PWERK']['_text'],
				DGLTP:  resp['DGLTP']['_text'],
				DGLTS:  resp['DGLTS']['_text'],
			
			
		});

	})

//prod order create

	app.post('/prodcreate', async (req, res) => {
		console.log("/prodcreate is called")


const POSNR = req.body.POSNR
const PSOBS = req.body.PSOBS
const PLNUM = req.body.PLNUM
const STRMP = req.body.STRMP
const ETRMP = req.body.ETRMP
const PSMNG = req.body.PSMNG
const MEINS = req.body.MEINS
const MATNR = req.body.MATNR
const LTRMP = req.body.LTRMP
const PWERK = req.body.PWERK
const DGLTP = req.body.DGLTP
const DGLTS = req.body.DGLTS

		const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
		<soapenv:Header/>
		<soapenv:Body>
		   <urn:BAPI_PRODORDERCREATE>
			 
			  <AUFNR>12345</AUFNR>
			  <DGLTP>${DGLTP}</DGLTP>
			  <DGLTS>${DGLTS}</DGLTS>
			  <ETRMP>${ETRMP}</ETRMP>
			  <LTRMP>${LTRMP}</LTRMP>
			  <MATNR>${MATNR}</MATNR>
			  <MEINS>${MEINS}</MEINS>
			  <PLNUM>${PLNUM}</PLNUM>
			  <POSNR>${POSNR}</POSNR>
			  <PSMNG>${PSMNG}</PSMNG>
			  <PSOBS>${PSOBS}</PSOBS>
			  <PWERK>${PWERK}</PWERK>
			  <STRMP>${STRMP}</STRMP>
			  <MESSAGE_TABLE>
				 
				 <item>
					
				  
				 </item>
			  </MESSAGE_TABLE>
		   </urn:BAPI_PRODORDERCREATE>
		</soapenv:Body>
	 </soapenv:Envelope>`;
	
		const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_ShopfloorPortal&receiverParty=&receiverService=&interface=SI_OUT_Prodordercreate_req&interfaceNamespace=http://sivaprakash.com/shopfloor',
			xmlBody, {
			headers
		}
		).then((response) => {
			return response.data
		}).catch((error) => {
			console.error(1e7 + 9)
			return error
		})
		let data = parser.xml2json(result, { compact: true, spaces: 2 })
		// prodresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERCREATE.Response']['MESSAGE_TABLE']['item']
		messageresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PRODORDERCREATE.Response']['RETURN']['MESSAGE']
		// console.log(prodresponse)
		console.log("messageresponse :",messageresponse)
		res.send(
	
			{
				// PUSER: prodresponse['PUSER']['_text'],
				Message : messageresponse,
			});
	
	})

//--------------------------------END OF SHOP FLOOR PORTAL--------------------------------//

//---------------------------------------EHSM PORTAL-------------------------------------//

//EHSM login
app.post('/ehsmlogin', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Ehsm_login&receiverParty=&receiverService=&interface=SI_OUT_ehsmlogin_req&interfaceNamespace=http://crimson-fern.com/ehsm',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	
	
	const ehsm_username = req.body.email;
	const ehsm_password = req.body.password;
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ehsm="http://crimson-fern.com/ehsm">
	<soapenv:Header/>
	<soapenv:Body>
	   <ehsm:MT_ehsmlogin_req>
		  <Username>${ehsm_username}</Username>
		  <Password>${ehsm_password}</Password>
	   </ehsm:MT_ehsmlogin_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];
		
		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			console.log("trial5",xml);
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_ehsmlogin_res'];
			console.log(resp);
			let token;
			if(resp['Status']['_text']==='1 '){
				// login sucess
				token = jwt.sign({
                    id:'1635',
                    email: 'ehsm@gmail.com'
                }, 'siva', {
                    expiresIn: 604800
                });
			} else {
				token = null;
			}
			res.send({
				Status: resp['Status']['_text'],
				token: token,
				username: req.body.email
			});
			
		});

		res1.on("error", function (error) {
			console.error('probably SAP is not working',error);
			
		});
	});

	req1.write(postData);

	req1.end();
});

//displaying EHSM Incident from ZTable ZTA_INCIDENT2

app.post('/incidentdisp',async (req, res) => {

	const eng_id = req.body.engID;
	let wa = '';
	console.log(wa);
	if(eng_id =='778')
	wa='WOT1';
	else
	wa='JPR';

	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
   <soapenv:Header/>
   <soapenv:Body>
      <urn:BAPI_INCIDENTDISPLAY>
   
         <WORKAREA>${wa}</WORKAREA>
         <INCIDENT_TABLE>

            <item>
  
            </item>
         </INCIDENT_TABLE>
      </urn:BAPI_INCIDENTDISPLAY>
   </soapenv:Body>
</soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Ehsm_login&receiverParty=&receiverService=&interface=SI_OUT_Incidentdisplay_req&interfaceNamespace=http://sivaprakash.com/ehsm',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	incidentdisplay = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_INCIDENTDISPLAY.Response']['INCIDENT_TABLE']['item']
	console.log(1e9+7, incidentdisplay)
	res.send(
		{
				incidentdisplay: incidentdisplay
	});

})

//Displaying second EHSM Incident
//PO done by Siva
//Consumed by Siva

app.post('/incidentdisp2', (req, res) => {
	console.log('received token is : ', req.headers.token);

	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Ehsm_login&receiverParty=&receiverService=&interface=SI_OUT_ehsm_incidentdisp_req&interfaceNamespace=http://crimson-fern.com/ehsm',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	const incident_id = req.body.incidentid;
	const eng_id = req.body.engID;
	

	
	const postData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ehsm="http://crimson-fern.com/ehsm">
	<soapenv:Header/>
	<soapenv:Body>
	   <ehsm:MT_ehsm_incidentdisp_req>
		  <eng_id>${eng_id}</eng_id>
		  <incident_id>${incident_id}</incident_id>
	   </ehsm:MT_ehsm_incidentdisp_req>
	</soapenv:Body>
 </soapenv:Envelope>`;

 console.log("Postdata:",postData);
	const req1 = http.request(options, function (res1) {
		const chunks = [];

		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});

		res1.on("end", function (chunk) {
			
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			console.log("data",data);
			const resp = JSON.parse(data)['SOAP:Envelope'];
			console.log('Parsing data: ',resp);
			var incidentfilter = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_ehsm_incidentdisp_res']['incident'];
			console.log("final parsing: ",incidentfilter);
			res.send({
				incidentid: incidentfilter['incident_id']['_text'],
				description:  incidentfilter['description']['_text'],
				customer:  incidentfilter['customer']['_text'],
				reporter:  incidentfilter['reporter']['_text'],
				processor:  incidentfilter['processor']['_text'],
				serviceteam:  incidentfilter['serviceteam']['_text'],
				status:  incidentfilter['status']['_text'],
				priority:  incidentfilter['priority']['_text'],
				createdon:  incidentfilter['createdon']['_text'],
				firstresponse:  incidentfilter['firstresponse']['_text'],
				endedon:  incidentfilter['endedon']['_text']
				
			})
		});

		res1.on("error", function (error) {
			console.error(error);
			
		});
	});

	req1.write(postData);

	req1.end();
});

//Creating EHSM Incident into Ztable ZTA_INCIDENT2



app.post('/incidentcreate', async (req, res) => {
		console.log("/incidentcreate is called")

const TITLE = req.body.TITLE
const DESCRIPTION = req.body.DESCRIPTION
const INCIDENTDATE = req.body.INCIDENTDATE
const INCIDENTTIME = req.body.INCIDENTTIME
const PERSONINJURED = req.body.PERSONINJURED
const CONTACTMAIL = req.body.CONTACTMAIL
const WITNESSNAME = req.body.WITNESSNAME
const WITNESSMAIL = req.body.WITNESSMAIL
const LOCATION = req.body.LOCATION
const WORKAREA = req.body.WORKAREA
const ACTION = req.body.ACTION

				  
		
	
		const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
		<soapenv:Header/>
		<soapenv:Body>
		   <urn:BAPI_INCIDENTCREATE>
			  
				<ACTION>${ACTION}</ACTION>
				<CONTACTMAIL>${CONTACTMAIL}</CONTACTMAIL>
				<DESCRIPTION>${DESCRIPTION}</DESCRIPTION>
				<INCIDENTDATE>${INCIDENTDATE}</INCIDENTDATE>
				<INCIDENTID>1221</INCIDENTID>
				<INCIDENTTIME>${INCIDENTTIME}</INCIDENTTIME>
				<LOCATION>${LOCATION}</LOCATION>
				<PERSONINJURED>${PERSONINJURED}</PERSONINJURED>
				<TITLE>${TITLE}</TITLE>
				<WITNESSMAIL>${WITNESSMAIL}</WITNESSMAIL>
				<WITNESSNAME>${WITNESSNAME}</WITNESSNAME>
				<WORKAREA>${WORKAREA}</WORKAREA>
			  <INCIDENT_TABLE>
				 
				 <item>
					
				 </item>
			  </INCIDENT_TABLE>
		   </urn:BAPI_INCIDENTCREATE>
		</soapenv:Body>
	 </soapenv:Envelope>`;
	
		const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Ehsm_login&receiverParty=&receiverService=&interface=SI_OUT_Incidentcreate_req&interfaceNamespace=http://sivaprakash.com/ehsm',
			xmlBody, {
			headers
		}
		).then((response) => {
			return response.data
		}).catch((error) => {
			console.error(1e7 + 9)
			return error
		})
		let data = parser.xml2json(result, { compact: true, spaces: 2 })
		// prodresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERCREATE.Response']['MESSAGE_TABLE']['item']
		messageresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_INCIDENTCREATE.Response']['RETURN']['MESSAGE']
		// console.log(prodresponse)
		console.log("messageresponse :",messageresponse)
		res.send(
	
			{
				// PUSER: prodresponse['PUSER']['_text'],
				Message : messageresponse,
			});
	
})

//displaying EHSM risk assessment from ZTable ZTA_RISK

app.post('/riskdisplay',async (req, res) => {

	const eng_id = req.body.engID;
	let wa = '';
	console.log(wa);
	if(eng_id =='778')
	wa='WOT1';
	else
	wa='JPR';

	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_RISKDISPLAY>
	  
	  <WORKAREA>${wa}</WORKAREA>
	  <RISK_TABLE>
		 <!--Zero or more repetitions:-->
		 <item>
			
		 </item>
	  </RISK_TABLE>
   </urn:BAPI_RISKDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_Ehsm_login&receiverParty=&receiverService=&interface=SI_OUT_Riskdisplay_req&interfaceNamespace=http://sivaprakash.com/ehsm',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	riskdisplay = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_RISKDISPLAY.Response']['RISK_TABLE']['item']
	console.log(1e9+7, riskdisplay)
	res.send(
		{
				riskdisplay: riskdisplay
	});

})




//--------------------------------------END OF EHSM PORTAL-------------------------------//



//--------------------------------Quality Checker PORTAL------------------------------//
//quality checker login
app.post('/qualitychecklogin', (req, res) => {
	
	var options = {
		'method': 'POST',
		'port': 50000,
		'host': 'dxktpipo.kaarcloud.com',
		'path': 'http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_QualityPortal&receiverParty=&receiverService=&interface=SI_OUT_QLogin_req&interfaceNamespace=http://crimon-fern.com/quality',
		'headers': {
			'Content-Type': 'application/xml',
			'Authorization': 'Basic UE9VU0VSOmthYXIyMDIw',
		},
		'maxRedirects': 20
	};
	
	
	
	const qc_username = req.body.email;
	const qc_password = req.body.password;
	
	const postData =  `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:qual="http://crimon-fern.com/quality">
	<soapenv:Header/>
	<soapenv:Body>
	   <qual:MT_QLogin_req>
		  <Username>${qc_username}</Username>
		  <Password>${qc_password}</Password>
	   </qual:MT_QLogin_req>
	</soapenv:Body>
 </soapenv:Envelope>`;
	const req1 = http.request(options, function (res1) {
		const chunks = [];
		
		res1.on("data", function (chunk) {
			chunks.push(chunk);
		});



		res1.on("end", function (chunk) {
			const body = Buffer.concat(chunks);
			const xml = body.toString();
			console.log("trial5",xml);
			const data = parser.xml2json(xml, {compact: true, spaces: 4});
			
			const resp = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:MT_QLogin_res'];
			console.log(resp);
			let token;
			if(resp['Status']['_text']==='1 '){
				// login sucess
				token = jwt.sign({
                    id:'1634',
                    email: 'Quality@gmail.com'
                }, 'siva', {
                    expiresIn: 604800
                });
			} else {
				token = null;
			}
			res.send({
				Status: resp['Status']['_text'],
				token: token,
				username: req.body.email
			});
			
		});

		res1.on("error", function (error) {
			console.error('probably SAP is not working',error);
			
		});
	});

	req1.write(postData);

	req1.end();
});


//displaying the lot inspection details from ZTA_INSPECTION2


app.post('/lotinspection',async (req, res) => {
	
	
	const eng_id = req.body.engID;
	let wa = '';
	console.log(wa);
	if(eng_id =='114')
	wa='SA01';
	else
	wa='SA02';

	
const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
   <urn:BAPI_INSPECTIONLOTDISPLAY>
	  <!--Youmay enter the following 2 items in any order-->
	  <PLANT>${wa}</PLANT>
	  <LOT_TABLE>
		 
		 <item>
			
			
		 </item>
	  </LOT_TABLE>
   </urn:BAPI_INSPECTIONLOTDISPLAY>
</soapenv:Body>
</soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_QualityPortal&receiverParty=&receiverService=&interface=SI_OUT_Inspection_req&interfaceNamespace=http://sivaprakash.com/quality',
		xmlBody, {
			headers
		}
	).then((response) => {
		return response.data
	}). catch((error) => {
		console.error(1e7+9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	lotinspection = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_INSPECTIONLOTDISPLAY.Response']['LOT_TABLE']['item']
	console.log(1e9+7, lotinspection)
	res.send(
		{
				lotinspection: lotinspection
	});

})


//displaying the LOT result record details from ZTA_RESULTRECORD

app.post('/resultrecord', async (req, res) => {
const ABOVETR = req.body.ABOVETR
const BELOWTR = req.body.BELOWTR
const DEFECTIVEQUANTITY = req.body.DEFECTIVEQUANTITY
const INSPECTIONID = req.body.INSPECTIONID
const INSPECTORID = req.body.INSPECTORID
const MATERIAL = req.body.MATERIAL
const PLANT = req.body.PLANT
const SAMPLESIZE = req.body.SAMPLESIZE
			  
	

	const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
	<soapenv:Header/>
	<soapenv:Body>
	   <urn:BAPI_RESULTRECORDINGCREATE>
		 
		  <ABOVETR>${ABOVETR}</ABOVETR>
		  <BELOWTR>${BELOWTR}</BELOWTR>
		  <DEFECTIVEQUANTITY>${DEFECTIVEQUANTITY}</DEFECTIVEQUANTITY>
		  <INSPECTIONID>${INSPECTIONID}</INSPECTIONID>
		  <INSPECTORID>${INSPECTORID}</INSPECTORID>
		  <MATERIAL>${MATERIAL}</MATERIAL>
		  <PLANT>${PLANT}</PLANT>
		  <RESULTID>123</RESULTID>
		  <SAMPLESIZE>${SAMPLESIZE}</SAMPLESIZE>
		  <RESULT_TABLE>
			 
			 <item>
			 
			 </item>
		  </RESULT_TABLE>
	   </urn:BAPI_RESULTRECORDINGCREATE>
	</soapenv:Body>
 </soapenv:Envelope>`;

	const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_QualityPortal&receiverParty=&receiverService=&interface=SI_OUT_resultrecording_req&interfaceNamespace=http://sivaprakash.com/quality',
		xmlBody, {
		headers
	}
	).then((response) => {
		return response.data
	}).catch((error) => {
		console.error(1e7 + 9)
		return error
	})
	let data = parser.xml2json(result, { compact: true, spaces: 2 })
	// prodresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERCREATE.Response']['MESSAGE_TABLE']['item']
	messageresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_RESULTRECORDINGCREATE.Response']['RETURN']['MESSAGE']
	// console.log(prodresponse)
	console.log("messageresponse :",messageresponse)
	res.send(

		{
			// PUSER: prodresponse['PUSER']['_text'],
			Message : messageresponse,
		});

})


//Creating usage decision for quality portal

app.post('/usagedecision', async (req, res) => {
	
const CODEGROUPOFUSAGEDECISION = req.body.CODEGROUPOFUSAGEDECISION;
const COUNTERFORUSAGEDECISION = req.body.COUNTERFORUSAGEDECISION;
const DATEOFUSAGEDECISION = req.body.DATEOFUSAGEDECISION;
const FOLLOWUPACTION = req.body.FOLLOWUPACTION;
const INSPECTIONLOTNO = req.body.INSPECTIONLOTNO;
const INSPECTORID = req.body.INSPECTORID;
const PLANT = req.body.PLANT;
const QUALITYSCORE = req.body.QUALITYSCORE;
const SELECTEDSETOFUSAGEDECISION = req.body.SELECTEDSETOFUSAGEDECISION;
const TIMEOFUSAGEDECISION = req.body.TIMEOFUSAGEDECISION;
const USAGEDECISIONCODE = req.body.USAGEDECISIONCODE;
				  
		
	
		const xmlBody = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
		<soapenv:Header/>
		<soapenv:Body>
		   <urn:BAPI_UDCREATE>
		 
			  <CODEGROUPOFUSAGEDECISION>${CODEGROUPOFUSAGEDECISION}</CODEGROUPOFUSAGEDECISION>
			  <COUNTERFORUSAGEDECISION>${COUNTERFORUSAGEDECISION}</COUNTERFORUSAGEDECISION>
			  <DATEOFUSAGEDECISION>${DATEOFUSAGEDECISION}</DATEOFUSAGEDECISION>
			  <FOLLOWUPACTION>${FOLLOWUPACTION}</FOLLOWUPACTION>
			  <INSPECTIONLOTNO>${INSPECTIONLOTNO}</INSPECTIONLOTNO>
			  <INSPECTORID>${INSPECTORID}</INSPECTORID>
			  <PLANT>${PLANT}</PLANT>
			  <QUALITYSCORE>${QUALITYSCORE}</QUALITYSCORE>
			  <SELECTEDSETOFUSAGEDECISION>${SELECTEDSETOFUSAGEDECISION}</SELECTEDSETOFUSAGEDECISION>
			  <TIMEOFUSAGEDECISION>${TIMEOFUSAGEDECISION}</TIMEOFUSAGEDECISION>
			  <USAGEDECISIONCODE>${USAGEDECISIONCODE}</USAGEDECISIONCODE>
			  <UD_TABLE>
			  
				 <item>
					
				 </item>
			  </UD_TABLE>
		   </urn:BAPI_UDCREATE>
		</soapenv:Body>
	 </soapenv:Envelope>`;
	
		const result = await axios.post('http://dxktpipo.kaarcloud.com:50000/XISOAPAdapter/MessageServlet?senderParty=&senderService=BC_QualityPortal&receiverParty=&receiverService=&interface=SI_UD_req&interfaceNamespace=http://sivaprakash.com/quality',
			xmlBody, {
			headers
		}
		).then((response) => {
			return response.data
		}).catch((error) => {
			console.error(1e7 + 9)
			return error
		})
		let data = parser.xml2json(result, { compact: true, spaces: 2 })
		// prodresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_PLANNEDORDERCREATE.Response']['MESSAGE_TABLE']['item']
		messageresponse = JSON.parse(data)['SOAP:Envelope']['SOAP:Body']['ns0:BAPI_UDCREATE.Response']['RETURN']['MESSAGE']
		// console.log(prodresponse)
		console.log("messageresponse :",messageresponse)
		res.send(
	
			{
				// PUSER: prodresponse['PUSER']['_text'],
				Message : messageresponse,
			});
	
	})
//--------------------------------END OF Quality Checker PORTAL------------------------------//
app.listen(8000, () => {
	console.log('Reading on port ', 8000);
})
