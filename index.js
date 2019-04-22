const http=require('http');
const request=require('request');
const PORT=process.env.PORT||5000;

const players=[
	2837719,
	1630228,
	123247,
	306209,
	1912490,
	59967,
];

const places=[
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
				ret.push([p,hashCache[p]]);
				if(a.length==players.length)res(a);
			}else{
				var thumb='http://www.roblox.com/headshot-thumbnail/image?width=48&height=48&Format=Png&userId='+p;
				request.get(thumb,(e,r,b)=>{
					var redir=r.request.uri.href.replace('http','https');
					a.push([p,hashCache[p]=redir]);
					if(a.length==players.length)res(a);
				});
			}
		});
	});
}

function playersInPlace(players,place){
	return new Promise(async res=>{
		var a=[];
		var m=0;
		var hashes=await getPlayerHashes(players);
		
		for(var c=0;c<=m;c+=7){
			var url=`https://www.roblox.com/games/getgameinstancesjson?placeId=${place}&startIndex=${c}`;
			request.get({url:url,headers:{Cookie:'.ROBLOSECURITY='+process.env.roblosecurity}},(e,r,b)=>{
				var t=JSON.parse(b);
				m=Math.max(m,t.TotalCollectionSize);
				t.Collection.forEach(coll=>{
					coll.CurrentPlayers.forEach(srvPl=>{
						for(var i=hashes.length-1;i>=0;i--){
							var hash=hashes[i];
							if(srvPl.Thumbnail.Url==hash[1]){
								a.push([hash[0],`Roblox.GameLauncher.joinGameInstance(${place},"${coll.Guid}")`]);
								hashes.splice(i,1);
							}
							if(hashes.length==0)res(a);
						}
					});
				});
			});
		}
		res(a);
	});
}

async function getPlayersOnline(players){
	var all=await new Promise(res=>{
		var a=[];
		players.forEach(p=>{
			request.get('https://www.roblox.com/search/users/presence?userIds='+p,(e,r,b)=>{
				if(!e){
					var p=JSON.parse(b).PlayerPresences[0];
					if(p.InGame)a.push([p,p.PlaceId>0?p.FollowToGameScript:null]);
					if(a.length==players.length)res(a);
				}
			});
		});
	});
	var willHash=[];
	all.forEach(p=>{
		if(!p[1])willHash.push(p[0]);
	});
	
	return new Promise(async res=>{
		var a=[];
		places.forEach(place=>{
			var results=await playersInPlace(willHash,place);
			results.forEach(r=>{
				var i=willHash.indexOf(r[0]);
				if(i>-1)willHash.splice(i,1);
				all[all.findIndex(v=>{return v[0]==r[0]})]=r;
			});
		});
	});
}

async function update(){
	var url='https://discordapp.com/api/webhooks/569744093115318274'
		+'/wM4ULEq-De_E_xDWzmwEdvcHjCGqtg9gVheZdAbiPxRkrFFAXQGsU-voL3JrGfNZrVSE';
	getPlayersOnline().then(a=>{
		a.forEach(v=>{
			request.post({url:url,json:{content:'``'+v.join(' - ')+'``'}});
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
