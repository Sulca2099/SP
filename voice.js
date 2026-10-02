let playing=false;
let thevoice;
function read(link){
    if(!playing){
        thevoice = new Audio(link);
        thevoice.play()
        playing=true;
    } else{
        thevoice.pause();
        playing=false;
        
    }
}