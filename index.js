const http=require('http');
const request=require('request');
const PORT=process.env.PORT||5000;

const places=[
	[2837719,606849621],
	//[1630228,2960624866],
	[123247,370731277],
	[306209,2414851778],
	[1912490,1537690962],
	[59967,1224212277],
];

function serverFromHash(player,place){
	return new Promise(res=>{
		request.get('https://www.roblox.com/search/users/presence?userIds='+player,(e1,r1,b1)=>{
			if(!e1&&JSON.parse(b1).PlayerPresences[0].InGame){
				var thumb='http://www.roblox.com/headshot-thumbnail/image?width=48&height=48&Format=Png&userId='+player;
				request.get(thumb,async(e2,r2,b2)=>{
					var redir=r2.request.uri.href.replace('http','https');
					var a=[];
					var m=0;
					for(var c=0;c<=m;c+=10){
						var url=`https://www.roblox.com/games/getgameinstancesjson?placeId=${place}&startIndex=${c}`;
						request.get({url:url,headers:{Cookie:'.ROBLOSECURITY='+process.env.roblosecurity}},(e3,r3,b3)=>{
							var t=JSON.parse(b3);
							m=Math.max(m,t.TotalCollectionSize);
							var srvr=t.Collection.find(v=>{
								return v.CurrentPlayers.find(v=>{
									return v.Thumbnail.Url==redir;
								});
							});
							console.log(c);
							if(srvr)res(srvr.JoinScript);
							else if(c+10>m)res(null);
						});
					}
				});
			}else res(null);
		});
	});
}

async function update(){
	places.forEach(v=>{
		serverFromHash(v[0],v[1]).then(v=>{
			var url='https://discordapp.com/api/webhooks/568574341764087992/p6VH8vQ-PbEoDmsm1eD6UoXagZniSX7XgO91gkXbDT_4CBGq61qoVV3risqCQkVV2nsV';
			if(v)request.post({url:url,json:{content:'``'+v+'``'}});
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
