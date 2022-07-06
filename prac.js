const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const ejs=require('ejs');

const app=express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/pracdb2',{useNewUrlParser: true});

const ItemSchema=new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item", ItemSchema);

const ListSchema =new mongoose.Schema({
  name:String,
  items:[ItemSchema]
});
const List=mongoose.model('List',ListSchema);

const item1=new Item({
  name:"Welcome to TodoList"
});
const item2=new Item({
  name:"<-- Hit this to delete an item"
});
const item3=new Item({
  name:"Hit the + button to add an item"
});

const defaultItems=[item1,item2,item3];

app.get('/',function(req,res){
  Item.find({},function(err,foundItems){
    if(err){
      console.log(err);
    }else{
      if(foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err);
          }else{
            console.log("Items update successfully..");
          }
        });
      }
    }
    res.render('list',{listTitle:"Today",newListItems:foundItems});
  });
});

app.get('/:customListName',function(req,res){
  const newListName=req.params.customListName;
  List.findOne({name:newListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const newList=new List({
          name:newListName,
          items:defaultItems
        });
        newList.save();
        res.redirect('/'+newListName);
      }else{
        res.render('list',{listTitle:newListName,newListItems:foundList.items});
      }
    }
  });
});

app.post('/',function(req,res){
  const listName=req.body.list;
  const newItem=new Item({
    name:req.body.newItem
  });
  if(listName=="Today"){
    newItem.save();
    res.redirect('/');
  }else{
    List.findOne({name:listName},function(err,foundList){
      if(err){
        console.log(err);
      }else{
        foundList.items.push(newItem);
        foundList.save();
        res.render('list',{listTitle:listName,newListItems:foundList.items});
      }
    });
  }
});

app.post('/delete',function(req,res){
  const chekedItemId=req.body.checkbox;
  const listName=req.body.listName;

  if(listName==='Today'){
    Item.deleteOne({_id:chekedItemId},function(err){
      if(err){
        console.log(err);
      }else{
        res.redirect('/');
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:chekedItemId}}},function(err,foundList){
      if(!err){
        res.redirect('/'+listName);
      }
    })
  }
});

app.get('/about',function(req,res){
  res.render('about');
})

app.listen(3000,function(req,res){
  console.log("Server is running successfully....");
});
