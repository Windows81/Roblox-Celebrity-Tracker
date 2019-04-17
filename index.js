const http=require('http');
const request=require('request');
const PORT=process.env.PORT||5000;

function serverFromHash(id,hash){
	return new Promise(res=>{
		var a=[];
		var m=0;
		for(var c=0;c<=m;c+=10){
		}
	});
}

function update(){
	request.get('https://www.roblox.com/search/users/presence?userIds='+2837719,(e1,r1,b1)=>{
		if(e1)return;
		if(true)//JSON.parse(b1).PlayerPresences.InGame){
			var thumb='http://www.roblox.com/headshot-thumbnail/image?width=48&height=48&Format=Png&userId='+2837719;
			request.get(thumb,async(e2,r2,b2)=>{
				console.log(r2.request.uri.href);
				await serverFromHash(606849621,r2.request.uri.href);
			});
		}
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
