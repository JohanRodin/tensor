//const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
//const btoa = require("btoa");
//const wml_credentials = new Map();

const my_params = {
	"api_key": "****put-your-apikey-here****",  // can be found in the credentials section of your ML instance
	"ml_instance_id": "****put-your-instanceid-here****", // can be found in the credentials section of your ML instance
	"deployment": "****put-your-deploymentid-here****" // can be found in the overview section of your deployed web service

};

function clear_squares() {
	//console.log("Is this called?");
	const canvas = document.getElementById('sketchpad');
    const context = canvas.getContext('2d');
	const footprint = {
        width: 32,
        height: 32
    };
    const zoom = 10;

	context.clearRect(0,0,footprint.width*zoom,footprint.height*zoom);
	document.getElementById('sketchpad').style.background = "white";

	document.getElementById('result').innerText = ""; //output.toString();
	document.getElementById('result').style.background = "white";
}

function renew_token() {
	return new Promise((resolve, reject) => {
	// Paste your Watson Machine Learning service apikey here
	var apikey = my_params['api_key']; 
	/*
	var options = { url     : "https://iam.bluemix.net/oidc/token",
                headers : { "Content-Type"  : "application/x-www-form-urlencoded",
                            "ML-Instance-ID" : "******" },
                body    : "apikey=" + apikey + "&grant_type=urn:ibm:params:oauth:grant-type:apikey" };
	*/
	var url = "https://cors-anywhere.herokuapp.com/https://iam.bluemix.net/oidc/token";
	var  body = "apikey=" + apikey + "&grant_type=urn:ibm:params:oauth:grant-type:apikey";

	const request= new XMLHttpRequest();
	request.addEventListener("load", resolve);
	request.addEventListener("error", reject);
	request.open('POST', url);
	request.setRequestHeader("Accept", "application/json");
	request.setRequestHeader("Access-Control-Allow-Headers", "*");
	request.setRequestHeader("Access-Control-Allow-Origin", "*");
	request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	request.setRequestHeader("ML-Instance-ID", my_params['ml_instance_id']);
	request.send(body);
	//console.log('response head: ' + request.responseText.substring(0, 15) + '...');

})
}

function score(mypayload) {

function apiPost(scoring_url, token, mlInstanceID, payload){
	return new Promise((resolve, reject) => {
	const oReq = new XMLHttpRequest();
	oReq.addEventListener("load", resolve);
	oReq.addEventListener("error", reject);
	oReq.open("POST", scoring_url);
	oReq.setRequestHeader("Accept", "application/json");
	oReq.setRequestHeader("Access-Control-Allow-Headers", "*");
	oReq.setRequestHeader("Access-Control-Allow-Origin", "*");
	oReq.setRequestHeader("Authorization", token);
	oReq.setRequestHeader("ML-Instance-ID", mlInstanceID);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send(payload);
})
}
// NOTE: generate iam_token based on provided documentation
let iam_token = '';

renew_token()
.then(resp => {
	//console.log(resp.currentTarget.response);
	var local_iam_token = JSON.parse( resp.currentTarget.response )["access_token"];
	//console.log("Token: " + local_iam_token);
	//iam_token = local_iam_token;
	return local_iam_token;
})
.then(iam_token => {
	//
const wmlToken = "Bearer " + iam_token;

// NOTE: retrieve ml_instance_id based on provided documentation
const mlInstanceId = my_params['ml_instance_id'];

// NOTE: manually define and pass the array(s) of values to be scored in the next line
//const payload = '{"values": [[[[64363], [64457], [64489], [64181], [64083], [64333], [64615], [64485], [64241], [64243], [64275], [64279], [64005], [64095], [64239], [64169], [64185], [63963], [64477], [64835], [64727], [64929], [64957], [64631], [64523], [65535], [65535], [64587], [64633], [64793], [64785], [64727]], [[64341], [63979], [64091], [64105], [64181], [64411], [64571], [64997], [64585], [64223], [64173], [64213], [64203], [64161], [64221], [64195], [64139], [64117], [64635], [64613], [64483], [64763], [64695], [64489], [65535], [62351], [55521], [64529], [65001], [64671], [64713], [64671]], [[64129], [63783], [63783], [63801], [64297], [64247], [64439], [64577], [64379], [64331], [64441], [64329], [64281], [64359], [64199], [64013], [64809], [64751], [64591], [64673], [64771], [64839], [64737], [65145], [64479], [52779], [55765], [64303], [65213], [64855], [64983], [64935]], [[64287], [64051], [64007], [64303], [64303], [64349], [64435], [64393], [64147], [64201], [64281], [63903], [64183], [64323], [63875], [64105], [64065], [63787], [64263], [64603], [65055], [64719], [64669], [65535], [55365], [55989], [65535], [63935], [64707], [64857], [64869], [64743]], [[64265], [63727], [63945], [64451], [64163], [64125], [64537], [64611], [64345], [64265], [64299], [64141], [64643], [64189], [63823], [65535], [59005], [58871], [65493], [64659], [64743], [64665], [65207], [62709], [53465], [64871], [65063], [64659], [64547], [64795], [64733], [64667]], [[64239], [64107], [63787], [64195], [64377], [63941], [64253], [64391], [64363], [64171], [64393], [65507], [60301], [60747], [65205], [63309], [55025], [61399], [65535], [64599], [64859], [64821], [65535], [55849], [57463], [65535], [64679], [64663], [64793], [64871], [64853], [64753]], [[64019], [63767], [63905], [64337], [64411], [64209], [64069], [65535], [65203], [63901], [64087], [65535], [57207], [59959], [65535], [59565], [54573], [64373], [65131], [64683], [65045], [65175], [63501], [54489], [64281], [65091], [64733], [64701], [64751], [64903], [64927], [64797]], [[63715], [63429], [63735], [63985], [64165], [64273], [65071], [61499], [61187], [64901], [64609], [62383], [55583], [64029], [65535], [57961], [57735], [63977], [64735], [64741], [64615], [65535], [56897], [57047], [65535], [64833], [64789], [64727], [64681], [64841], [64917], [64793]], [[63943], [63873], [63869], [63815], [64955], [64893], [65535], [54907], [58863], [65519], [65535], [58229], [55295], [65535], [62735], [56401], [60933], [64315], [64291], [64589], [64893], [64373], [54543], [63167], [65271], [64707], [64895], [64675], [64625], [64659], [64667], [64793]], [[63903], [63869], [63789], [64963], [62003], [60749], [63827], [55059], [64779], [64241], [65535], [56007], [57489], [65535], [60219], [55641], [62925], [65213], [64469], [64747], [65535], [58479], [55675], [65535], [64815], [64833], [64757], [64631], [64607], [64911], [65289], [64797]], [[63945], [63657], [63433], [65535], [57559], [59549], [59629], [55217], [65535], [64173], [65001], [54877], [61305], [65535], [59799], [55713], [62787], [64965], [64331], [64493], [65535], [55563], [59909], [65535], [64671], [64927], [64853], [64831], [64791], [64631], [62271], [64731]], [[63867], [63759], [63907], [65535], [54737], [62367], [53811], [57777], [63463], [64755], [61095], [55301], [65127], [64925], [57803], [56269], [64249], [63965], [64277], [65159], [62297], [55245], [65277], [64909], [64505], [64681], [64743], [64745], [65447], [62625], [58831], [65387]], [[63745], [63891], [64519], [62807], [54671], [60775], [49251], [63965], [62991], [65457], [57759], [57395], [61533], [60075], [56327], [57001], [65535], [63831], [64385], [65535], [57195], [57253], [65535], [64743], [64737], [64711], [64647], [64617], [65535], [60131], [59665], [65535]], [[63861], [63833], [65535], [58791], [58821], [56629], [50385], [65535], [65107], [65535], [53523], [49379], [60335], [54811], [44859], [50989], [64455], [64533], [64405], [65377], [55651], [62205], [65349], [64817], [64799], [64625], [64625], [64731], [65535], [57431], [59521], [65535]], [[64057], [63731], [65535], [57297], [58479], [51759], [58663], [65535], [61313], [65535], [50439], [52651], [48267], [45309], [53939], [52555], [59025], [65189], [65361], [59901], [55637], [65535], [64593], [65155], [64905], [64515], [64675], [64695], [65535], [57739], [62167], [65227]], [[63951], [64005], [65197], [56869], [54667], [51857], [62825], [60461], [63577], [58807], [59275], [59627], [44989], [59961], [65535], [65373], [62451], [64055], [65535], [56361], [58787], [65535], [65135], [63397], [63981], [64767], [64321], [65263], [63145], [59171], [65535], [65535]], [[64159], [65377], [60381], [52287], [56895], [56251], [47067], [52123], [54333], [53431], [65093], [63223], [65535], [65535], [63837], [64361], [64325], [64051], [63591], [55617], [64167], [65471], [64543], [56775], [62565], [65115], [64433], [65535], [58751], [55737], [63797], [61187]], [[63891], [65535], [57209], [40385], [60145], [60291], [53075], [56533], [51431], [63169], [65465], [64305], [64627], [64363], [64525], [64301], [64031], [65535], [58875], [56949], [65535], [65099], [60885], [61327], [65535], [65535], [64799], [65535], [60411], [53521], [55239], [57629]], [[64273], [64639], [55479], [53369], [62683], [65515], [65535], [65535], [65535], [65023], [63801], [64081], [63987], [64161], [64327], [64427], [63769], [65535], [57203], [59939], [65535], [63849], [62113], [56261], [54897], [61773], [65535], [63947], [65535], [60193], [48875], [61637]], [[65535], [58633], [56285], [65535], [63983], [64053], [64081], [64181], [64393], [64103], [64121], [64161], [64271], [64229], [63837], [63989], [64161], [63473], [56275], [64265], [64973], [62649], [65331], [59147], [56547], [56097], [57041], [60025], [64637], [65055], [55663], [61981]], [[65535], [54745], [60479], [65181], [63797], [64003], [64181], [64159], [64263], [64415], [64249], [64201], [64233], [64355], [64215], [63847], [65535], [58303], [56271], [65535], [62733], [62497], [65281], [65535], [65535], [64013], [55701], [61605], [65179], [65217], [65535], [65535]], [[57293], [52771], [65535], [64001], [64037], [64077], [64321], [64341], [64479], [64273], [64153], [64345], [64471], [64175], [64125], [63951], [65535], [56459], [59375], [65535], [61895], [64133], [64961], [64729], [64783], [65535], [65535], [65535], [64883], [64797], [64707], [64897]], [[52477], [57701], [65535], [63941], [64155], [64203], [64507], [64553], [64215], [64149], [64417], [64565], [64463], [64183], [64055], [64271], [63519], [56237], [64443], [63091], [62199], [65535], [64517], [64813], [64845], [64699], [64721], [64873], [64853], [64899], [64759], [64777]], [[62613], [64245], [64063], [64093], [64111], [64187], [64281], [64353], [64203], [64189], [64415], [64483], [64105], [64051], [64159], [65247], [59535], [56273], [65535], [61361], [63835], [65287], [64595], [64757], [64831], [64681], [64713], [64813], [64771], [64901], [64803], [64645]], [[64893], [64267], [64101], [64211], [64219], [64039], [64151], [64325], [64279], [64177], [64317], [64049], [63805], [64037], [63945], [65535], [56795], [58679], [64641], [61149], [65535], [64697], [64731], [64821], [64781], [64885], [64861], [64781], [64729], [64743], [64823], [64685]], [[63933], [63919], [64065], [64195], [64081], [64049], [64101], [64253], [64099], [64159], [64427], [64227], [64005], [63969], [63889], [65277], [56007], [62513], [61113], [62161], [65193], [64563], [64757], [64789], [64685], [64813], [64867], [64813], [64619], [64753], [64639], [64585]], [[63699], [63761], [64077], [64261], [64061], [64161], [64045], [64089], [64237], [64357], [64165], [64051], [63835], [64035], [64587], [61821], [56453], [63495], [59243], [64877], [64499], [64687], [64725], [64709], [64833], [64723], [64755], [64867], [64923], [64933], [64723], [64855]], [[63753], [63741], [63905], [63989], [64291], [64051], [63919], [64101], [64373], [64625], [63987], [63877], [63761], [63741], [65407], [59133], [59295], [60957], [59127], [65535], [64649], [64651], [64593], [64635], [64659], [64627], [64629], [64691], [64755], [64767], [64709], [64735]], [[63769], [64021], [63949], [63805], [63893], [63947], [64133], [64135], [64393], [64499], [63929], [64077], [63945], [63781], [65535], [59243], [59423], [58069], [63323], [65009], [64691], [64743], [64505], [64663], [64603], [64739], [64769], [64675], [64441], [64595], [64699], [64443]], [[63929], [63671], [63991], [64181], [63963], [64017], [64299], [64109], [64213], [64301], [63981], [64175], [63925], [63759], [65333], [61365], [53949], [57611], [65535], [64443], [64403], [64603], [64643], [64657], [64597], [64633], [64811], [64745], [64749], [64661], [64697], [64803]], [[63881], [63617], [63771], [64243], [64131], [63967], [64425], [64389], [64149], [64263], [64171], [64237], [64113], [63921], [65535], [57995], [48671], [63105], [65137], [64499], [64361], [64449], [64683], [64713], [64623], [64493], [64583], [64611], [64721], [64769], [64881], [64825]], [[63663], [63667], [63581], [63953], [64247], [64045], [64225], [63977], [63921], [64165], [64027], [63883], [64049], [64023], [64217], [61191], [60387], [65305], [64181], [64603], [64713], [64723], [64637], [64817], [64819], [64619], [64667], [64791], [64673], [64625], [64837], [64899]]]]}';
let newArrSunday = [...mypayload];
//console.log("Sunday, bloody Sunday: ");
//console.log(newArrSunday);

const payload = JSON.parse('{"values": []}');
payload.values[0] = newArrSunday;

let str_payload = JSON.stringify(payload);
//console.log(str_payload);

const scoring_url = "https://cors-anywhere.herokuapp.com/https://us-south.ml.cloud.ibm.com/v3/wml_instances/" + my_params['ml_instance_id'] + "/deployments/" + my_params['deployment'] + "/online";
return {"url": scoring_url, "token": wmlToken, "inst": mlInstanceId, "payload": str_payload};
})
.then(obj_resp => apiPost(obj_resp.url, obj_resp.token, obj_resp.inst, obj_resp.payload)
)
.then(resp => {
	let parsedPostResponse;
	try {
		parsedPostResponse = JSON.parse(resp.currentTarget.response);
	} catch (ex) {
		// TODO: handle parsing exception
	}
	console.log("Scoring response");
	console.log(parsedPostResponse);
	if (parsedPostResponse.errors && ((parsedPostResponse.errors[0].code === 'invalid_authentication_credentials') || (parsedPostResponse.errors[0].code === 'expired_authorization_token'))) {
		document.getElementById('result').style.fontSize = "12pt";
		document.getElementById('result').innerHTML = "<font size=\"5\"><span style=\"line-height:2px\">Failed to authenticate</span></font>";
		//document.getElementById('result').innerText = "<font size=\"5\">Failed to authenticate</font>"; //output.toString();
		document.getElementById('result').style.background = "orange";
		document.getElementById('result').style.fontSize = "64pt";
	} else {
	console.log(JSON.stringify(parsedPostResponse.values[0]));


	if (parsedPostResponse.values[0][0] === 1) {
		document.getElementById('result').innerText = "True"; //output.toString();
		document.getElementById('result').style.background = "green";
	}
		else {
			document.getElementById('result').innerText = "False"; //output.toString();
			document.getElementById('result').style.background = "red";
		}
	}

})
.catch(() => { console.log("Error");

		document.getElementById('result').style.fontSize = "12pt";
		document.getElementById('result').innerHTML = "<font size=\"5\"><span style=\"line-height:2px\">API call failed, check the log!</span></font>";
		//document.getElementById('result').innerText = "<font size=\"5\">Failed to authenticate</font>"; //output.toString();
		document.getElementById('result').style.background = "orange";
		document.getElementById('result').style.fontSize = "64pt";
	
	}
); 
};
