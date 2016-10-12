//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);

        var imgLoader:egret.ImageLoader = new egret.ImageLoader;
        imgLoader.once(egret.Event.COMPLETE,this.imgLoadHandler,this);
        imgLoader.load("resource/dong1.jpg");

        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event:RES.ResourceEvent):void {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private textfield:egret.TextField;

    private _dog:egret.Bitmap;
    private _vcLocation:Array<egret.Point>;
    private _idxCurrLocation:number;
    private _rotCommon:number;

    private imgLoadHandler(evt:egret.Event):void{
        var bmd:egret.BitmapData = evt.currentTarget.data;

        this._vcLocation = [
            new egret.Point(110, 345)
            ,new egret.Point(160, 500)
            ,new egret.Point(110, 500)
            ,new egret.Point(160, 345)
        ];
        this._rotCommon = 180 / Math.PI + Math.atan2(
            this._vcLocation[1].y - this._vcLocation[0].y, this._vcLocation[1].x - this._vcLocation[0].x);
        this._dog = new egret.Bitmap(bmd);
        this._dog.anchorOffsetX = bmd.width / 2;
        this._dog.anchorOffsetY = bmd.height / 2;
        //this.addChild(this._dog);

        this._dog.x = this._vcLocation[3].x;
        this._dog.y = this._vcLocation[3].y;
        this._dog.rotation = - 90;
        console.log(this._rotCommon);
        this.launchTween();
    }

    private launchTween(){
        egret.Tween.get(this._dog,{loop: true})
            .to({x: this._vcLocation[0].x, y: this._vcLocation[0].y}, 500)
                .call(() => {this._dog.rotation = 180 - this._rotCommon;}).wait(200)
            .to({x: this._vcLocation[1].x, y: this._vcLocation[1].y}, 500)
                .call(() => {this._dog.rotation = - 90;}).wait(200)
            .to({x: this._vcLocation[2].x, y: this._vcLocation[2].y}, 500)
                .call(() => {this._dog.rotation = this._rotCommon;}).wait(200)
            .to({x: this._vcLocation[3].x, y: this._vcLocation[3].y}, 500)
                .call(() => {this._dog.rotation = - 90;}).wait(200)
    }

    private MoveTotalPage(totalStage: any,PageNumber: number): void{
        //页面转换
        
        totalStage.touchEnabled = true;
        totalStage.addEventListener(egret.TouchEvent.TOUCH_BEGIN,(e: egret.TouchEvent) => {
            //计算手指和要拖动的对象的距离            
            offsetY = e.stageY - totalStage.y;
            //手指在屏幕上移动，触发 onMove 方法
            totalStage.addEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);}
        );

        var offsetY: number;
        var stageW: number = this.stage.stageWidth;
        var stageH: number = this.stage.stageHeight;

        function onMove(MouseTouch: egret.TouchEvent): void{
            //计算手指在屏幕上的位置，计算当前对象的坐标            
            totalStage.y = MouseTouch.stageY - offsetY;
            totalStage.addEventListener(egret.TouchEvent.TOUCH_END, stopMove, this);
        }

        function stopMove(MouseTouch: egret.TouchEvent){
            var thisObjectMove = egret.Tween.get(this);            
            var currentY = MouseTouch.stageY - offsetY;
            if(currentY < -(stageH / 2)){
                thisObjectMove.to({y: -stageH - 200},100).to({y: -stageH + 150},150).to({y:-stageH},150);
            }
            else{
                thisObjectMove.to({y: -200},100).to({y: + 150},150).to({y: 0},150);
            }
            //手指离开屏幕，移除手指移动的监听
            totalStage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onMove, this);
        }
    }

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {

        var allPages = new egret.DisplayObjectContainer();
        var firstPages = new egret.DisplayObjectContainer();
        var secondPages = new egret.DisplayObjectContainer();
        this.addChild(allPages);
        allPages.addChild(firstPages);
        allPages.addChild(secondPages);
        secondPages.y = stageH;

        //以下为第一页
        var sky:egret.Bitmap = this.createBitmapByName("background1_jpg");
        firstPages.addChild(sky);
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        firstPages.addChild(sky);
        this.MoveTotalPage(this,2);
        
        var topMask = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.2);
        topMask.graphics.drawRect(0, 0, stageW, 320);
        topMask.graphics.endFill();
        topMask.y = 25;
        firstPages.addChild(topMask);

        var icon:egret.Bitmap = this.createBitmapByName("touxiang1_jpg");
        this.addChild(icon);
        icon.x = 25;
        icon.y = 50;

        var line = new egret.Shape();
        line.graphics.lineStyle(2,0xffffff);
        line.graphics.moveTo(0,0);
        line.graphics.lineTo(0,200);
        line.graphics.endFill();
        line.x = 250;
        line.y = 50;
        firstPages.addChild(line);


        var colorLabel = new egret.TextField();//Hello Everyone
        colorLabel.textColor = 0xffffff;
        colorLabel.width = stageW - 100;
        colorLabel.textAlign = "center";
        colorLabel.text = "Hello Everyone";
        colorLabel.size = 36;
        colorLabel.x = 175;
        colorLabel.y = 50;
        firstPages.addChild(colorLabel);

        var introname = new egret.TextField();//姓名   点击变换颜色
        introname.width = stageW - 200;
        introname.textAlign = "center";
        introname.size = 34;
        introname.textColor = 0xffffff;
        introname.text = "我是李博瑶"
        introname.x = 225;
        introname.y = 105;
        firstPages.addChild(introname);        
        
        var colors:Array<number> = [];
        colors.push(0xff0000);
        colors.push(0xFFA500);
        colors.push(0xffff00);
        colors.push(0x00ff00);
        colors.push(0x0000ff);
        colors.push(0x800080);

        var count:number = 0;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            count %= colors.length;
            introname.textColor = colors[count++];
        },this);
        firstPages.addChild(introname);

        var intropersonality = new egret.TextField();//性格   点击变换倾斜                
        intropersonality.width = stageW - 200;
        intropersonality.textAlign = "center";
        intropersonality.size = 28;
        intropersonality.textColor = 0x000000;
        intropersonality.text = "性格 坦率、热情、讲求原则";
        intropersonality.x = 225;
        intropersonality.y = 150;
        intropersonality.italic = false;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            intropersonality.italic = !intropersonality.italic;
        },this);
        firstPages.addChild(intropersonality);

        var introworkattitude = new egret.TextField();//工作   点击变换倾斜                
        introworkattitude.width = stageW - 200;
        introworkattitude.textAlign = "center";
        introworkattitude.size = 28;
        introworkattitude.textColor = 0x000000;
        introworkattitude.text = "工作    认真负责，能吃苦耐劳";
        introworkattitude.x = 225;
        introworkattitude.y = 195;
        introworkattitude.italic = false;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            introworkattitude.italic = !introworkattitude.italic;
        },this);
        firstPages.addChild(introworkattitude);

        var introteamwork = new egret.TextField();//团队   点击变换倾斜                
        introteamwork.width = stageW - 200;
        introteamwork.textAlign = "center";
        introteamwork.size = 28;
        introteamwork.textColor = 0x000000;
        introteamwork.text = "团队    善于沟通、协调";
        introteamwork.x = 225;
        introteamwork.y = 240;
        introteamwork.italic = false;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            introteamwork.italic = !introteamwork.italic;
        },this);
        firstPages.addChild(introteamwork);

        var textfield = new egret.TextField();//变化字
        firstPages.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW - 200;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 30;
        textfield.textColor = 0xffffff;
        textfield.x = 200;
        textfield.y = 285;
        this.textfield = textfield;

        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this)

        var introhobby = new egret.TextField();//喜好   点击变换加粗                
        introhobby.width = stageW - 200;
        introhobby.textAlign = "center";
        introhobby.size = 45;
        introhobby.textColor = 0x000000;
        introhobby.text = "喜爱小动物";
        introhobby.x = 25;
        introhobby.y = 990;
        introhobby.bold = false;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            introhobby.bold = !introhobby.bold;
        },this);
        firstPages.addChild(introhobby);

        firstPages.addChild(this._dog);

        //以下为第二页
        var sky2:egret.Bitmap = this.createBitmapByName("background2_jpg");
        secondPages.addChild(sky2);        
        sky2.width = stageW;
        sky2.height = stageH;
        sky2.y = 1164;
        secondPages.addChild(sky2);

        /*var introhobby = new egret.TextField();//喜好   点击变换加粗                
        introhobby.width = stageW - 200;
        introhobby.textAlign = "center";
        introhobby.size = 45;
        introhobby.textColor = 0x000000;
        introhobby.text = "喜爱小动物";
        introhobby.x = 25;
        introhobby.y = 50;
        introhobby.bold = false;
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP,function(){
            introhobby.bold = !introhobby.bold;
        },this);
        secondPages.addChild(introhobby);*/


    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result:Array<any>):void {
        var self:any = this;

        var parser = new egret.HtmlTextParser();
        var textflowArr:Array<Array<egret.ITextElement>> = [];
        for (var i:number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield = self.textfield;
        var count = -1;
        var change:Function = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];

            self.changeDescription(textfield, lineArr);

            var tw = egret.Tween.get(textfield);
            tw.to({"alpha": 1}, 200);
            tw.wait(2000);
            tw.to({"alpha": 0}, 200);
            tw.call(change, self);
        };

        change();
    }

    /**
     * 切换描述内容
     * Switch to described content
     */
    private changeDescription(textfield:egret.TextField, textFlow:Array<egret.ITextElement>):void {
        textfield.textFlow = textFlow;
    }
}


