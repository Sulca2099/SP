const al = getHeight()/10;//the main unit
const speed=[-1.7,0];//the speed vector
let gravity=2.6;//the gravity value
let game=[];//ths holds the swing
let points=[];//the array that holds the points
let hard="easy";//the value of the game intensity
let tol=25;//the accuracy value tolerance, to land on swing
let textm=[];//the text for the screen
let you;//player prototype value
let bc=0;//score
let mb=0;//high score
let achivements=[];
let t;//achivement text
let down = 0;//location of achivement
let playeda;//played audio
let extrabutton;//the button that can be used whenever
let playingrightnow=false;//if the sound is playing
function caaa(req,name){//catch and append achivement
    if(bc>req[0] && achivements.indexOf(name)==-1 && (hard==req[1] || req[1]=="none")){
        achivements.push(name)
        t = new Text(`you earned a new achivement! ${name}`,"10pt arial");
        t.setPosition(0,30+down*15);
        add(t);
        down+=1;
    }
    
}
function drs(){//resets the game when the player clicks, do reset
    removeAll();
    startgame();//resets
}
function die(){//when the player breaks the alive rule
    stopTimer(maintick);
    let whatyou=(bc>=67) ? "won" : "LOST";
    let death=new Text(`you ${whatyou}!\rscore=${bc}`,"20pt Arial");
    death.setPosition(getWidth()/2*.6,getHeight()/2);
    add(death);
    if(bc>mb){
        mb=bc;
    }
    caaa([0,"none"],"get one point - good start");
    caaa([9,"none"],"double digets points - almost their!");
    caaa([66,"none"],"beat the game - ok");
    caaa([130,"none"],"get above 130 - respectable");
    caaa([66,"medium","beat the game in medium - very good"]);
    caaa([0,"hard"],"get a point in hard mode - awesome");
    caaa([66,"hard"],"beat the game in hard mode - impossible!");
    mouseClickMethod(drs);
    t=0;
    bc=0;    
}
function dtr(d){//converts degrees to radians
    return Math.PI/180*d
}
function setpostitions(draw){//caculates the pendilums location and velocity
    draw.velocity+=(gravity/6)*Math.sin(dtr(90-draw.angle));
    draw.angle+=draw.velocity/al*(180/Math.PI);
    return [draw.velocity,draw.angle];
}
function rg(x,y,z){//checks if an object is in bounds rg=range
    return x+z>=y && x-z<=y ;
}
class ball{//the players charecter
    idowner;
    location;
    velocity;
    you;
    pidowner;
    constructor(idowner){//intilises the player
        this.idowner=idowner;
        this.you=new WebImage('https://codehs.com/uploads/9feca184d64729abce982590f056ba42');
        this.you.setSize(30,30);
        this.velocity=[0,0];
        this.location=[0,0];
        this.pidowner=-1;
    }
    draw(){//draws the player first
        add(this.you);
    }
    tick(){//ticks the code
        
        if(this.idowner!=-1){
            
           this.location[0]=game[this.idowner].thedraw[0].getX();
           this.location[1]=game[this.idowner].thedraw[0].getY();
           if(!game[this.idowner].alive){
               die();
           }
        } else{
            if(this.location[0]<0||this.location[0]>getWidth()||this.location[1]<0||this.location[1]>getHeight()){
                die();
            }
            this.velocity[1]-=gravity;
            this.location[0]-=this.velocity[0];
            this.location[1]-=this.velocity[1];
            
            for(let x=this.pidowner;x<game.length && x>=0 && game[x].alive;x+=-1*(this.velocity[0]/Math.abs(this.velocity[0]))){
                if(rg(game[x].thedraw[0].getX(),this.location[0],getWidth()/tol) && rg(game[x].thedraw[0].getY(),this.location[1],getWidth()/tol) && (game[x].tickf>40 || game[x].tickf==-1)){
                    this.idowner=x;
                    println("caught");
                    bc++;
                    break;
                }
            }//optimized
            /*for(let x=0;x<game.length;x++){
                if(rg(game[x].thedraw[0].getX(),this.location[0],getWidth()/tol) && rg(game[x].thedraw[0].getY(),this.location[1],getWidth()/tol) && (game[x].tickf>10 || game[x].tickf==-1)){
                    this.idowner=x;
                    println("caught");
                    bc++;
                    break;
                    
                }
            }//unoptimed*/
            for(let x=0;x<points.length;x++){
                //console.log(x);
                points[x].findme(this.location);
            }
            
        }
        this.location[0]+=speed[0];
        this.location[1]+=speed[1];
        this.you.setPosition(this.location[0],this.location[1]);
        
    }
    jump(){
        let vect=game[this.idowner].fullyjump(this);
        this.location=vect[0];
        this.velocity=vect[1];
        this.pidowner=this.idowner;
        this.idowner=-1;
        
    }
}
class point{//the class for points
    location;
    body;
    alive;
    points;
    constructor(location){
        this.location = location;
        this.body = new Circle(10);
        this.body.setPosition(this.location[0],this.location[1]);
        this.body.setColor(Randomizer.nextColor());
        add(this.body);
        this.alive=true;
        this.points=1;
        
    }
    kill(){
        remove(this.body);
        this.alive=false;
    }
    move(){
        if(this.alive){
            this.location[0]+=speed[0];
            this.location[1]+=speed[1];
            this.body.setPosition(this.location[0],this.location[1]);
        }
    }
    
}
class bigpoint{//the class for apples (5 points)
    location;
    body;
    alive;
    points;
    constructor(location){
        this.location = location;
        this.body = new WebImage("https://codehs.com/uploads/b2e33566714718b3c3dfbbbfdecc8c87");
        this.body.setPosition(this.location[0],this.location[1]);
        this.body.setColor(Randomizer.nextColor());
        add(this.body);
        this.alive=true;
        this.points=5;
        
    }
    kill(){
        remove(this.body);
        this.alive=false;
    }
    move(){
        if(this.alive){
            this.location[0]+=speed[0];
            this.location[1]+=speed[1];
            this.body.setPosition(this.location[0],this.location[1]);
        }
    }
}
class pointerbody{//the point searching binary tree. holds the values to make sure the O is less than O(1) (for the amount of points)
    body;//the point list
    alive;
    locationx;//the mean location
    locationxs;//the location of the farthest left point x
    locationxm;//the location of the right far point x
    first;
    constructor(first=false){
        this.body=[];
        this.alive=true;
        this.locationx=0;
        this.locationxs=0;
        this.locationxm=0;
        this.first=first;//is first point body
    }
    findme(location){//determines the body is worth searching
        //console.log(location<=this.locationxm)
        if(location[0]<=this.locationxm && location[0]>=this.locationxs){
            //console.log("here");
            for(let x=0;x<this.body.length;x++){
                if(rg(this.body[x].location[0],location[0],10)&&rg(this.body[x].location[1],location[1],10)&&this.body[x].alive){
                    bc+=this.body[x].points;
                    this.body[x].kill();
                    if(this.first){
                        caaa([0,"none"],"playing with a \"glitch\" - bruh");
                    }
                }
            }
        }
        
    }
    tick(){//ticks the point body
        if(this.body[this.body.length-1].location[0]<0){
            this.alive=false;
            for(let x=0;x<this.body.length;x++){
                this.body[x].kill()
            }
        }
        if(this.alive && !this.first){
            for(let x=0;x<this.body.length;x++){
                this.body[x].move();
            }
            this.locationxs+=speed[0];
            this.locationxm+=speed[0];
        }

        
    }
    push(value){//adds a new point
        this.body.push(value);
        this.locationx=(this.locationx*(this.body.length-1)+this.body[this.body.length-1])/this.body.length;
        this.locationxs=Math.min(this.locationxs,this.body[this.body.length-1].location[0])
        this.locationxm=Math.max(this.locationxs,this.body[this.body.length-1].location[0])
    }
}
class swing{//the class for he swing
    height;
    width;
    location;//list
    thedraw;//list of drawed
    velocity;
    angle;//in radians
    alive;
    tickf;//th ticks for catching
    constructor(location,height,width,sa){//sa=starting angle
        this.location=location;
        this.height=height;
        this.width=width;
        this.angle=sa;
        this.velocity=0;
        this.alive=true;
        this.tickf=0//the tick of the cooldown value once jumped
        this.thedraw=[new Circle(getWidth()/25),new Line(location[0],location[1]-height,location[1],location[0]),new Line(location[0],location[1]-height,location[0]+getHeight()/10,location[1]),new Line(location[0],location[1]-height,location[0]-getHeight()/10,location[1])];
    }
    draw(){
        
        for(let x=0;x<this.thedraw.length;x++){
            add(this.thedraw[x]);
        }
        
        
    }
    transform(vec){//transforms the swing
    
        for(let x=0;x<this.thedraw.length;x++){
            this.thedraw[x].move(vec[0],vec[1]);
        }
        this.location[0]+=vec[0];
        this.location[1]+=vec[1];
        if(this.location[0]<=0){
            this.alive=false;
            for(let x=0;x<this.thedraw.length;x++){
                remove(this.thedraw[x]);
            }
        }
    }
    tick(){//ticks the swing
    
        if(this.alive){
            this.velocity=setpostitions(this)[0];
            this.angle=setpostitions(this)[1];
            //this.thedraw[1].setPosition(this.location[0]-this.height,this.location[1]-this.height);
            this.thedraw[1].setEndpoint(this.location[0]+al*Math.cos(dtr(this.angle)),this.location[1]+al*Math.sin(dtr(this.angle)));
        
            this.thedraw[0].setPosition(this.location[0]+al*Math.cos(dtr(this.angle)),this.location[1]+al*Math.sin(dtr(this.angle)));
            if(this.tickf!=-1){
                this.tickf++;
            }
            
        }
    }
    fullyjump(ball){//allows the sing to jump
        this.velocity*=.8;
        let blocation=[this.thedraw[0].getX(),this.thedraw[0].getY()];
        let bvelocity=[this.velocity*Math.sin(dtr(this.angle))*2.5,-this.velocity*Math.cos(dtr(this.angle))*10];
        let bheld=-1;
        this.tickf=0;
        return [blocation,bvelocity,bheld];
    }
}
function keyd(ke){//this is for scanning the key
    console.log("button.")
    switch(ke.keyCode){
        case Keyboard.letter("d"):
            you.jump();
            break;
        default:
            console.log("No mapped keys.");
            break;
    }
}
let ticks=0;
game=[new swing([getWidth(),getHeight()-140],40,Randomizer.nextInt(20,60),0)];
game[0].draw();
function click(_){
    you.jump();
}
function maintick(){//this is the main  game loop
    //console.log("here")
    ticks++;
    
    you.tick();
    for(let x=0;x<points.length;x++){
        points[x].tick();
    }
    for(let x=0;x<game.length;x++){
        game[x].tick();
        game[x].transform(speed);
    }
    
    if(Randomizer.nextInt(0,2000)<2 || ticks%(Math.floor(ticks/300)+100)==0){
        //you.jump();
        game.push(new swing([getWidth(),getHeight()-80],40,Randomizer.nextInt(20,60),Randomizer.nextInt(-20,5)));
        game[game.length-1].draw();
        points.push(new pointerbody());
        for(let x=0;x<10;x++){
            points[points.length-1].push((Randomizer.nextInt(0,10)>3) ? new point([x*getWidth()/20+getWidth(),getHeight()*.8-Math.sin(dtr(x))*20]) : new bigpoint([x*getWidth()/20+getWidth(),getHeight()*.8-3*Math.sin(x/2)*20]));
        }
    }
    
    if(game.length>30){
        game.splice(0,1);
        points.splice(0,1);
        you.pidowner++;
        if(you.idowner!=-1){
            you.idowner++
        }
    }//randomly generate and edit the list
}
function maintickclone(){//this is the game loop for the starting screen
    ticks++;
    
    for(let x=0;x<game.length;x++){
        game[x].tick();
        game[x].transform(speed);
    }
    
    if(Randomizer.nextInt(0,2000)<2 || ticks%100==0){
        //you.jump();
        game.push(new swing([getWidth(),getHeight()-80],40,Randomizer.nextInt(20,60),Randomizer.nextInt(-20,20)));
        game[game.length-1].draw();
        
    }
    
    if(game.length>30){
        game.splice(0,1);
    }//randomly generate and edit the list
}
function reset(){//this resets the screen
    stopTimer(maintickclone);
    if(extrabutton!=null){
        remove(extrabutton[0]);
        remove(extrabutton[1]);
        extrabutton=null;
    }
    
    playeda.pause();
    playeda=null;
    ticks=0;
    removeAll();
    points=[];
    //points[points.length-1].push(new point([getWidth()*1.2,getHeight()*.4]),new point([getWidth()*1.1,getHeight()*.4]))
    game=[new swing([getWidth(),getHeight()-180],40,Randomizer.nextInt(20,60),0)];
    game[0].draw();
    you = new ball(0);
    you.draw();
    setTimer(maintick,66);
    mouseClickMethod(click);
    keyDownMethod(keyd);
    if(textm!=null){
        textm=null;
    }
}
function menuclick(loc){//this scans where the user clicked for the menu
    let ele = getElementAt(loc.getX(),loc.getY());
    if(textm.indexOf(ele)>=1 && textm.indexOf(ele)<=3){
        let f= textm.indexOf(ele)-1;
        gravity=[1.4,4,9.81][f];
        tol=[6.25,12.5,25][f];
        hard=["easy","medium","hard"][f];
        reset();
        
        
        
    }
    else if(textm.indexOf(ele)>=4 && textm.indexOf(ele)<=textm.length || textm.indexOf(ele)==0){
        for(let ac=0;ac<achivements.length;ac++){//ac=achivment
            alert(achivements[ac]);
        }
        alert(`high score of ${mb}`);
    }
    else if(extrabutton.indexOf(ele)!=-1){
        if(playingrightnow){
            playeda.pause();
            playingrightnow=false;
        } else{
            playeda.play();
            playingrightnow=true;
        }
    }
}
function startgame(){//sets the game to the starting menu
    playeda = new Audio('https://codehs.com/uploads/a883c43db0b74b362a2c4e08296fb82d');//starts the game music
    playeda.play();
    playingrightnow=true;
    playeda.loop=true;
    extrabutton=[new Rectangle(50,20),new Text("toggle music","6pt Roboto")];
    extrabutton[0].setPosition(getWidth()-50,getHeight()-20);
    extrabutton[0].setColor("red");
    extrabutton[1].setPosition(getWidth()-45,getHeight()-7);
    extrabutton[1].setColor("green");
    add(extrabutton[0]);
    add(extrabutton[1]);
    textm = [new Text("Swing parkour!","30pt Arial"),new Text("easy","10pt Arial"), new Text("medium","10pt Arial"),new Text("hard","10pt Arial")];
    for(let x=0;x<textm.length;x++){
        textm[x].setPosition(getWidth()/2*.6,100+(x*40));
        add(textm[x])
    }
    let x=0;
    for(let a of achivements){
        textm.push(new Text(a,"5pt Arial"));
        textm[textm.length-1].setPosition(0,x*20+20)
        add(textm[textm.length-1])
        x++;
    }
    if(mb>0){
        textm.push(new Text(`high score! ${mb} point${mb>1 ? 's' : ''}!`,'5pt Arial'));
        textm[textm.length-1].setPosition(getWidth()-100,15);
        add(textm[textm.length-1]);
    }
    mouseClickMethod(menuclick)
    setTimer(maintickclone,66);
}
//let a = new Circle(10);
//a.setPosition(getWidth()/2,getHeight()/2)
//add(a);

//reset();
startgame();