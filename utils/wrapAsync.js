module.export =(fn)=>{
   return (x,y)=>{
    fn(x,y);
   };
   
};