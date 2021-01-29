import React from 'react'
import {HuePicker} from 'react-color'
import './App.css';

class App extends React.Component {
  state={
    currentTarget:'',
    select:'hex',
    color:'',
    addForm:{
      order:Date.now().toString(),
      id:Date.now().toString(),
      name:'',
      type:'',
      color: '',
    },
    table: [
      
    ]
    
  }
  componentDidMount(){
    if(localStorage.table && localStorage.table.length > 1){
      this.setState({table:JSON.parse(localStorage.getItem('table'))})
    }
  }

  huePickerChange = (color)=>{
    this.setState({color:color}, ()=> console.log(this.state.color.rgb))
    if (this.state.select == 'hex'){
    this.setState({addForm:{...this.state.addForm, color:color.hex}})
    }
    else if(this.state.select == 'rgba'){
      this.setState({addForm:{...this.state.addForm, color:`rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})` }})
    }else{
      this.setState({addForm:{...this.state.addForm, color:`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})` }})
    }
  }

  selectChange =(event)=>{
    this.setState({select:event.target.value})
    console.log(event.target.value)
    if(event.target.value == 'rgb'&& this.state.color.rgb){
      const{r,g,b,a} = this.state.color.rgb
      this.setState({addForm:{...this.state.addForm,color:`rgb(${r}, ${g}, ${b})` }})
    }
    else if(event.target.value == 'rgba' && this.state.color.rgb){
      const{r,g,b,a} = this.state.color.rgb
      this.setState({addForm:{...this.state.addForm,color:`rgba(${r}, ${g}, ${b}, ${a})` }})
    }
    else{
      this.setState({addForm:{...this.state.addForm,color: this.state.color.hex}})
    }
  }

  changeAddString = (event)=>{
    var inputName = event.target.name;
    var inputValue = event.target.value;
    this.setState({addForm:{...this.state.addForm, [inputName]:inputValue}},() => console.log(this.state.addForm))
}

  addStringToTable = (event) =>{
    event.preventDefault()
    this.setState({table:[...this.state.table, {...this.state.addForm}]},()=> localStorage.setItem('table', JSON.stringify(this.state.table)))
    this.setState({addForm:{name:'',type:'',color: '' , id:Date.now().toString(), order:Date.now().toString()}})
  }

  deleteString =(id)=>{
    const newTable = this.state.table.filter((el)=> el.id !== id)
    this.setState({table:newTable},()=> localStorage.setItem('table', JSON.stringify(this.state.table)))
    
  }

  dragStartHandler = (e, el) =>{
    console.log('drag',  el)
    this.setState({currentTarget:el})
  }
  dragEndHandler=(e)=>{
    e.target.style.background = 'none'

  }
  
  dragOverHandler=(e)=>{
    e.preventDefault()
    e.target.style.background = 'lightgray'

  }

  dropHandler=(e,el)=>{
    e.preventDefault()
    console.log('drop',el)
   const sortedOrder = this.state.table.map((card)=>{
      if(card.id === el.id){
        return {...card, order: this.state.currentTarget.order}
      }
      if(card.id === this.state.currentTarget.id){
        return{...card, order:el.order}
      }
      return card
    })
    this.setState({table:sortedOrder})

    e.target.style.background = 'none'
  }

  sortCard =(a,b)=>{
    if(a.order > b.order){
      return 1
    }
    else{
      return -1
    }
  }

  handlerChangeTableIntem = (e, id)=>{
    console.log(e.target)
    const tr = e.target.name
    const vl = e.target.value
    let idx = this.state.table.findIndex((el)=> el.id === id)
    let newTable = this.state.table.map((el)=> {
      if(el.id === id){
        return {...el, [tr] : vl}
      }else{
        return el
      }
      
    })
    this.setState({table:[...newTable]},()=> localStorage.setItem('table', JSON.stringify(this.state.table)))
    }

  render(){
    return (
      <div className="App">
      <h1 className='title'>Редактор табличных данных</h1>
      <form className='add_form'>
        <p  className='add_form_item' >Имя<input onChange={this.changeAddString}  value = {this.state.addForm.name} name='name'/></p>
        <p  className='add_form_item'>Тип<input  onChange={this.changeAddString} value = {this.state.addForm.type} name='type'/></p>
        <p  className='add_form_item'>
          Цвет 
          <select onChange={this.selectChange} className='add_form_select'>
            <option>hex</option>
            <option>rgb</option>
            <option>rgba</option>
          </select>
          <input onChange={this.changeAddString}  value={this.state.addForm.color && this.state.addForm.color} name='color'readOnly />
        </p>
        
        <p className='add_form_picker'><HuePicker width = {'100%'} color={this.state.addForm.color} onChange={this.huePickerChange} /></p>
        <button className='add_form_button' onClick={this.addStringToTable}>Добавить</button>
      </form>
      <ul className = "table">
        {this.state.table.length >0 ? this.state.table.sort(this.sortCard).map((el) => {
          return <li 
          className="table_item"
           key={el.id}
           draggable={true}
           onDragStart={(e)=> this.dragStartHandler(e, el)}
           onDragLeave={(e)=> this.dragEndHandler(e)}
           onDragEnd={(e)=> this.dragEndHandler(e)}
           onDragOver={(e)=> this.dragOverHandler(e)}
           onDrop={(e)=> this.dropHandler(e,el)}
           >
             <input className='table_item_input' onChange={(e)=>this.handlerChangeTableIntem(e, el.id)} value ={el.name} name='name'></input> 
             <input className='table_item_input' onChange={(e)=>this.handlerChangeTableIntem(e, el.id)} value = {el.type} name='type'></input> 
             <input className='table_item_input' onChange={(e)=>this.handlerChangeTableIntem(e, el.id)} value ={el.color} name='color'></input>
             <div style={{height:'50px', width:'50px', background:el.color}}></div>
          <button className="table_item_button_delete" onClick={()=>this.deleteString(el.id)}>
            Удалить
          </button> 
          </li>}): <p>Таблица пуста</p>}
      </ul>

      </div>
    );
  }
}

export default App;
