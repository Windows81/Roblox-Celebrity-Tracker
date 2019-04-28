const http=require('http');
const request=require('request');
const PORT=process.env.PORT||5000;
var headers={Cookie:'.ROBLOSECURITY='+process.env.roblosecurity};

const players=[
	2837719,//asimo3089
	//1630228,
	123247,//alexnewtron
	//306209,//vCaffy
	1912490,//Onett
	339310190,//Flamingo
	59967,//taymaster
];

const places=[
	527730528,
	69184822,
	920587237,
	292439477,
	735030788,
	2512643572,
	606849621,
	2960624866,
	370731277,
	2414851778,
	1537690962,
	1224212277,
];

var hashCache=[];
function getPlayerHashes(players){
	return new Promise(res=>{
		var a=[];players.forEach(p=>{
			if(hashCache[p]!=null){
				a.push([p,hashCache[p]]);
				if(a.length==players.length)res(a);
			}else{
				var thumb='http://www.roblox.com/headshot-thumbnail/image?width=48&height=48&Format=Png&userId='+p;
				request.get(thumb,(e,r,b)=>{
					var redir=r.request.uri.href.replace('http','https');
					a.push([p,hashCache[p]=redir]);
					console.log(redir);
					if(a.length==players.length)res(a);
				});
			}
		});
	});
}

function playersInPlace(players,place){
	return new Promise(async res=>{
		var a=[];
		var hashes=await getPlayerHashes(players);
		var m=await new Promise(res=>{
			var url=`https://www.roblox.com/games/getgameinstancesjson?placeId=${place}&startIndex=0`;
			request.get({url:url,headers:headers},(e,r,b)=>{res(JSON.parse(b).TotalCollectionSize)});
		});
		
		var count1=0;
		var count2=0;
		for(var c=0;c<=m;c+=7){
			count1++;
			var url=`https://www.roblox.com/games/getgameinstancesjson?placeId=${place}&startIndex=${c}`;
			request.get({url:url,headers:headers},(e,r,b)=>{
				count2++;
				var t=JSON.parse(b);
				m=Math.max(t.TotalCollectionSize,m);
				t.Collection.forEach(coll=>{
					coll.CurrentPlayers.forEach(srvPl=>{
						for(var i=hashes.length-1;i>=0;i--){
							var hash=hashes[i];
							if(srvPl.Thumbnail.Url==hash[1]){
								a.push([hash[0],place,coll.Guid]);
								hashes.splice(i,1);
							}
							if(hashes.length==0)res(a);
						}
					});
				});
				if(count1==count2&&count1>0)res(a);
			});
		}
	});
}

async function getPlayersOnline(players,places){
	var all=await new Promise(res=>{
		var a=[];
		players.forEach(p=>{
			var url='https://www.roblox.com/search/users/presence?userIds='+p;
			request.get({url:url,headers:headers},(e,r,b)=>{
				if(!e){
					var pp=JSON.parse(b).PlayerPresences[0];
					a.push([p,pp.PlaceId>0?pp.PlaceId:pp.InGame?undefined:null]);
					if(a.length==players.length)res(a);
				}
			});
		});
	});
	var filtered=[];
	all.forEach(p=>{
		if(p[1]!==null)filtered.push(p[0]);
	});
	
	places=places.slice(0);
	all.forEach(v=>{
		var id=parseInt(v[1]);
		if(!places.includes(id)&&id)
			places.push(id);
	});
	
	return await new Promise(async res=>{
		var a=[];
		for(var c=0;c<places.length;c++){
			var place=places[c];
			var hashable=filtered.slice(0);
			var results=await playersInPlace(filtered,place);
			results.forEach(t=>{
				var i=filtered.indexOf(t[0]);
				if(i>-1)filtered.splice(i,1);
				request.get(`https://api.roblox.com/users/${t[0]}`,(e,r,b)=>{
					t.unshift(JSON.parse(b).Username);a.push(t);
					if(a.length==results.length)res(a);
				});
			});
		}
	});
}

async function update(){
	var url='https://discordapp.com/api/webhooks/569744093115318274'
		+'/wM4ULEq-De_E_xDWzmwEdvcHjCGqtg9gVheZdAbiPxRkrFFAXQGsU-voL3JrGfNZrVSE';
	getPlayersOnline(players,places).then(a=>{
		a.forEach(v=>{
			if(!v[2])return;
			var content=`\`\`\`js\n// User: ${v[0]} - ${v[1]}\nRoblox.GameLauncher.joinGameInstance(${v[2]},"${v[3]}")\`\`\``;
			request.post({url:url,json:{content:content}});
		});
	});
}

const server=http.createServer((req,res)=>{
	res.statusCode=200;
	res.setHeader('Content-Type','text/plain');
	res.end('The server should be checking.');
});
server.listen(PORT,()=>{
	console.log(`Server running on ${PORT}/`);
});
update();
setInterval(()=>{request.get('https://asimo3089-tracker.herokuapp.com/')},69000);
setInterval(update,69000);
