var crypto =require('crypto'),
		User = require('../models/user.js'),
		Post = require('../models/post.js');
		
var express = require('express');
var router = express.Router();

//首页页面
router.get('/', function(req, res) {
	Post.get(null, function(err,posts){
		if(err){
			posts=[];
		}
		res.render('index', {
			title: '首页',
			posts:posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

//注册页面
router.get('/reg',function(req,res){
	res.render('reg',{
		title:'注册',
		user:req.session.user,
		success:req.flash('success').toString(),
		error:req.flash('error').toString()
	});

});

//注册提交
router.post('/reg', checkNotLogin);
router.post('/reg',function(req,res){
	var name = req.body.name,
	password=req.body.password,
	password_re=req.body['password-repeat'];
	//验证密码是否相同
	if(password != password_re){
		req.flash('error','两次密码输入不一致！');
		return res.redirect('/reg');
	}
	
	//生成密码的MD5
	var md5 = crypto.createHash('md5'),
			password= md5.update(req.body.password).digest('hex');
	var newUser = new User({
		name: req.body.name,
		password:password,
		email:req.body.email
	});
	//检查用户是否存在
	User.get(newUser.name, function(err,user){
		if(err){
			req.flash('error',err);
			return res.redirect('/');
		}
		if(user){
			req.flash('error','用户已经存在');
			return res.redirect('/reg')
		}
		//如果不存在
		newUser.save(function(err,user){
			if(err){
				req.flash('error',err);
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success','注册成功');
			res.redirect('/');
		});
	});
});

//登录页面
router.get('/login', checkNotLogin);
router.get('/login',function(req,res){
	res.render('login',{
		title:'登录',
		user:req.session.user,
		success:req.flash('success').toString(),
		error:req.flash('error').toString()
	});
	
});

//登录提交
router.post('/login', checkNotLogin);
router.post('/login',function(req,res){
	//生成MD5值
	var md5=crypto.createHash('md5'),
			password=md5.update(req.body.password).digest('hex');
	User.get(req.body.name,function(err,user){
		if(!user){
			req.flash('error','用户不存在');
			return res.redirect('/login');//用户不存在跳到登
		}
		if(user.password != password){
			req.flash('error','密码错误');
			return res.redirect('/login');
		}
		req.session.user=user;
		req.flash('success','登录成功');
		res.redirect('/');
	});
});

//发表页面
router.get('/post', checkLogin);
router.get('/post',function(req,res){
	res.render('post',{
		title:'发表',
		user:req.session.user,
		success:req.flash('success').toString(),
		error:req.flash('error').toString()
	});
});

//发表提交
router.post('/post', checkLogin);
router.post('/post',function(req,res){
	var currentUser=req.session.user,
		post=new Post(currentUser.name,req.body.title,req.body.post);
		
	post.save(function(err){
		if(err){
			req.flash('error',err);
			return res.redirect('/');
		}
		req.flash('success','发布成功！');
		res.redirect('/');
	})
});

//登出
router.get('/logout', checkLogin);
router.get('/logout',function(req,res){
	req.session.user=null;
	req.flash('success','登出成功');
	res.redirect('/');
});


function checkLogin(req,res,next){
	if(!req.session.user){
		req.flash('error','未登录！');
		res.redirect('/login');
	}
	next();
}
function checkNotLogin(req,res,next){
	if(req.session.user){
		req.flash('error','已登录');
		res.redirect('back');
	}
	next();
}

module.exports = router;
