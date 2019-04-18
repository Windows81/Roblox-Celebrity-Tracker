const http=require('http');
const request=require('request');
const PORT=process.env.PORT||5000;

const places=[
	//[2837719,606849621],
	[1630228,2960624866],
];

function serverFromHash(id,hash){
	return new Promise(res=>{
		console.log(id,hash);
		var a=[];
		var m=0;
		for(var c=0;c<=m;c+=10){
			var url=`https://www.roblox.com/games/getgameinstancesjson?placeId=${id}&startIndex=${c}`;
			request.get(url,(e,r,b)=>{
				var t=JSON.parse(b);
				m=Math.max(m,t.TotalCollectionSize);
				var srvr=t.Collection.find(v=>{
					return v.CurrentPlayers.find(v=>{
						console.log(v.Thumbnail.Url);
						return v.Thumbnail.Url==hash;
					});
				});
				console.log(srvr.Guid);
			});
		}
	});
}

function update(){
	places.forEach(v=>{
		request.get('https://www.roblox.com/search/users/presence?userIds='+v[0],(e1,r1,b1)=>{
			if(e1)return;
			if(JSON.parse(b1).PlayerPresences[0].InGame){
				var thumb='http://www.roblox.com/headshot-thumbnail/image?width=48&height=48&Format=Png&userId='+v[1];
				request.get(thumb,async(e2,r2,b2)=>{
					console.log(r2.request.uri.href);
					await serverFromHash(v[1],r2.request.uri.href);
				});
			}
		});
	});
}

const server=http.createServer((req,res)=>{
	update();
	res.statusCode=200;
	res.setHeader('Content-Type','text/plain');
	res.end('The server should be checking.');
});
server.listen(PORT,()=>{
	console.log(`Server running on ${PORT}/`);
});
update();
setInterval(update,69000);
