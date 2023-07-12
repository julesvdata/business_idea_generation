var timeout = 500000

var chatMessages = null
var chatLoader = null
var ideas_tmp = null
var gender_tmp = null
var age_tmp = null
var idea_tmp = null
var trend_tmp = null
var industry_tmp = null

$(document).ready(function(){

  $('.sidenav').sidenav();
  $('.tooltipped').tooltip();
  $('.modal').modal();
  $('select').formSelect();

  document.getElementById("load_title").innerHTML = "Generating Ideas ..."
  document.getElementById("load_subtitle").innerHTML = "This should only take a minute."

  const trend_value = document.getElementById("trend_select").value
  if (trend_value != 'None'){
    generate_ideas(true)
  } else{
    select_element = document.getElementById("trend_select")
    select_element.value = ""
  }

  const chatInput = document.getElementById("chat-input");
  const sendMessage = document.getElementById("send-message");
  chatMessages = document.querySelector(".chat-messages");
  chatLoader = document.getElementById("chat-loader");
  chatButton = document.getElementById("chat-button");

  //Add keyboard event listeners
  sendMessage.addEventListener("click", function (event) {
    event.preventDefault();
    if (chatInput.value.trim() !== "") {
      addMessage(chatInput.value, "user-message");
      sendChatRequest(chatInput.value);
      chatInput.value = "";
    }
  });

  chatInput.addEventListener("keydown", function (event) {
    if (chatButton.style.display != "none"){
      if (event.key === "Enter") {
        addMessage(chatInput.value, "user-message");
        sendChatRequest(chatInput.value);
        chatInput.value = "";
      }
    }
  })

  document.addEventListener('keydown', function(event) {
    if (chatButton.style.display == "none"){
      if (event.key === "Enter") {
          generate_ideas(true)
        }
    }
  })
})

String.prototype.addSlashes = function() 
{ 
   //no need to do (str+'') anymore because 'this' can only be a string
   return this.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
} 

function get_idea_card_row_html(ideas,idea_value,start,end){

    b = '<div class="row" style="margin-left:0px;margin-right:0px;margin-bottom:5px;">'

    for (var i = start; i < end; i++) {
        e = ideas[i]

        if (typeof e != "undefined") {
          var header = '<div class="card-title center-align"><h5>' + e[0] +'</h5></div>'
          var body = '<div class="center-align" style="font-size: 18px;">' + e[1] +'</div>'
          if (idea_value == 'new product'){
            var explore_button = `<a style="cursor: pointer; margin-right:0px;" onclick="load_explore_product_divs('`+ e[0].addSlashes() + `','` + e[1].addSlashes() +`')">Explore</a>`
          } else if (idea_value == 'marketing campaign'){
            var explore_button = `<a style="cursor: pointer; margin-right:0px;" onclick="load_explore_campaign_divs('`+ e[0].addSlashes() + `','` + e[1].addSlashes() +`')">Explore</a>`
          } else if (idea_value == 'business strategy'){
            var explore_button = `<a style="cursor: pointer; margin-right:0px;" onclick="load_explore_strategy_divs('`+ e[0].addSlashes() + `','` + e[1].addSlashes() +`')">Explore</a>`
          } else if (idea_value == 'business model'){
            var explore_button = `<a style="cursor: pointer; margin-right:0px;" onclick="load_explore_business_models_divs('`+ e[0].addSlashes() + `','` + e[1].addSlashes() +`')">Explore</a>`
          }
          var card = `<div class="col s4" style="height:calc(38vh);">
            <div class="card col s12" style="height: calc(38vh - 6px); overflow: hidden; width: 100%;">
              <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc; margin-bottom: 10px"><h6>`+header+`</h6></div>
              <div id="network_meta_trends" style="height: calc(55%); overflow-y: scroll;">`+body+`
              </div>
              <div class="card-action center-align">
                `+explore_button+`
              </div>
            </div>
          </div>`
          b+= card
        }
    }
    var final = b

    return final

}

function generate_ideas(initial){

    if (initial==true){
      document.getElementById("body").style.cssText = "pointer-events:none;";
    }

    var ideas_div = document.getElementById("further_ideas_card_div");

    if (initial==true){
      $('#load_modal').modal('open');
      ideas_div.innerHTML = ''
    } else {
      document.getElementById("more_button_div").innerHTML = `<div class="preloader-wrapper small active loader" style="position:relative;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>`;
    }

    const gender_value = document.getElementById("gender_select").value
    const age_value = document.getElementById("age_select").value
    const idea_value = document.getElementById("idea_select").value
    const trend_value = document.getElementById("trend_select").value
    const industry_value = document.getElementById("industry_value").value

    gender_tmp = gender_value
    age_tmp = age_value
    idea_tmp = idea_value
    trend_tmp = trend_value
    industry_tmp = industry_value

    url = '/get_initial_ai_ideas'
    data ={'gender':gender_value,'age':age_value,'idea':idea_value,'trend':trend_value,'industry':industry_value}
      
    fetchData(url, data)
      .then(responseData => {

          initial_ideas = responseData['initial_ideas']

          if (initial!=true){

            more_button_div.outerHTML = ""
            for (i in initial_ideas){
              ideas_tmp.push(initial_ideas[i])
            }
            
          } else{
            ideas_tmp = initial_ideas
          }

          put_ideas(initial_ideas,idea_value)
          
          $('#load_modal').modal('close');
          document.getElementById("body").style.cssText = "pointer-events:auto;";

      }).catch(error => console.error('Failed to fetch data:', error));

}

function put_ideas(ideas,idea_value){
    var ideas_div = document.getElementById("further_ideas_card_div");

    number_rows = Math.ceil(ideas.length/3)

    for (var i = 0; i < number_rows; i++) {
      row = get_idea_card_row_html(ideas,idea_value,(i*3),(i+1)*3)
      ideas_div.innerHTML += row
    }

    b = '<div class="row center-align" id="more_button_div" style="margin-left:0px;margin-right:0px;margin-bottom:5px;"><div id="more_button" class="center-align"><a class="waves-effect waves-light btn" onClick="loadMore()"><i class="material-icons right">sync</i>More</a></div></div>'

    ideas_div.innerHTML += b
}

function back(){

    const textbox = document.getElementById("chat-input");
    textbox.disabled = false;
    textbox.value = "";

    var parent_div = document.getElementById("page_parent_div");
    parent_div.innerHTML = ''

    var chat_button = document.getElementById("chat-button");
    chat_button.style.display = "none";

    var chat_div = document.getElementById("messages-div");
    chat_div.innerHTML = ''

    parent_div.innerHTML = `<div class="col s12" style="height:calc(13vh); padding:0px 10px 0px 10px; position: fixed; width: 100%; z-index:10;" id="ideas_card_div">
    <div class="card-panel col s12" style="height:calc(12vh - 12px); " id="ideas_div">
          <div class = "row valign-wrapper">
          <div class="input-field col s2" style="margin-top:20px">
            <input placeholder="e.g. automotive" id="industry_value" type="text" class="validate">
            </input>
            <label for="industry_value">Industry</label>
          </div>
          <div class="input-field dark col s2" style="margin-bottom:0px; margin-top:5px">
            <select multiple class="select_all" id="gender_select">
              <option value="female" >Female</option>
              <option value="male" >Male</option>
            </select>
            <label>Target Gender</label>
          </div>
          <div class="input-field dark col s2" style="margin-bottom:0px; margin-top:5px">
            <select multiple class="select_all" id="age_select">
              <option value="0-14" >0-14</option>
              <option value="15-24" >15-24</option>
              <option value="25-54" >25-54</option>
              <option value="55-64" >55-64</option>
              <option value="65+" >65+</option>
            </select>
            <label>Target Age</label>
          </div>
          <div class="input-field dark col s2" style="margin-bottom:0px; margin-top:5px">
            <select class="select_all" id="idea_select">
              <option value="new product">New Product</option>
              <option value="marketing campaign">Marketing Campaign</option>
              <option value="business strategy" selected>Business Strategy</option>
              <option value="business model" selected>Business Model</option>
            </select>
            <label>Idea Type</label>
          </div>
          <div class="input-field col s2" style="margin-top:20px">
              <input placeholder="e.g. space exploration" id="trend_select" type="text" class="validate" value="{{ meta_trend }}">
              <label for="trend_select">Meta-Trend</label>
            </div>
          <div class="col s1">
            <a class="btn waves-effect waves-light #26a69a" onclick="generate_ideas(true)">Submit
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="col s12" style="height:calc(85vh); padding:0px 10px 0px 10px; margin-top: calc(13vh + 5px); z-index: -1;" id="further_ideas_card_div"></div>`

    var industry_input = document.getElementById("industry_value");
    industry_input.value += industry_tmp;
    var trend_input = document.getElementById("trend_select");
    trend_input.value += trend_tmp;
  
    M.updateTextFields();

    $('#gender_select').val(gender_tmp);
    $('#age_select').val(age_tmp);
    $('#idea_select').val(idea_tmp);
    $('#trend_select').val(trend_tmp);

    $('select').formSelect();

    put_ideas(ideas_tmp, idea_tmp)
}

function load_explore_product_divs(title,description){

    var parent_div = document.getElementById("page_parent_div");
    parent_div.innerHTML = ''

    var chat_button = document.getElementById("chat-button");
    chat_button.style.display = "block";

    var chat_div = document.getElementById("messages-div");
    chat_div.innerHTML = `<div id="initial_message" class="message response-message"><p>Hi! I'm your personal product consultant for <b>`+ title +`</b>. What would you like to know?</p></div>`

  //<button onclick="downloadPDF()">Download PDF</button>
  parent_div.innerHTML = `<div class="row" style="margin-bottom:0px;position: relative;" id="page_parent_div">
  <div class="col s12" style="height:calc(17vh); padding:0px 10px 0px 10px; margin-top: 0px; z-index: -1;" id="ideas_div">
    <div class="card-panel col s12" style="height: calc(17vh); overflow: hidden; width: 100%;">
      <div class="row">
        <div class="col s12" style="width:3%; margin-top:15px;"><i style="pointer-events:auto; cursor: pointer;" onclick="back()" class="material-icons">arrow_back</i></div>
        <div class="col s12" style="width:95%">
          <h4 style="margin-top:10px">`+ title +`</h4>
        </div>
        <div class="col s12" style="font-size:20px; margin-left:3%; width: 95%">`+ description +`</div>
      </div>
    </div>  
  </div>
  <div class="col s6" style="height:calc(24vh); padding:0px 10px 0px 10px; margin-top: 10px; z-index: -1;" id="further_ideas_card_div">
    <div class="card-panel col s12" style="height: calc(22vh); overflow: hidden; width: 100%;">
      <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Product Details</h5></div>
      <div id="product_details" style="height: calc(100% - 60px); overflow-y: scroll;">
        <div class="preloader-wrapper small active" style="top:40%;left:48%;">
          <div class="spinner-layer spinner-blue-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle">
              </div>
            </div>
            <div class="circle-clipper right">
              <div class="circle">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col s6" style="height:calc(24vh); padding:0px 10px 0px 10px; margin-top: 10px; z-index: -1;" id="further_ideas_card_div">
    <div class="card-panel col s12" style="height: calc(22vh); overflow: hidden; width: 100%;">
      <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Price Point</h5></div>
      <div id="price_point" style="height: calc(100% - 60px); overflow-y: scroll;">
      <div class="preloader-wrapper small active" style="top:40%;left:48%;">
          <div class="spinner-layer spinner-blue-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle">
              </div>
            </div>
            <div class="circle-clipper right">
              <div class="circle">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col s12" style="height:calc(28vh); padding:0px 10px 0px 10px; margin-top: 0px; z-index: -1;" id="further_ideas_card_div">
    <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
      <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Product Roadmap</h5></div>
      <div id="roadmap" style="height: calc(100% - 60px); overflow-y: scroll;">
      <div class="preloader-wrapper small active" style="top:40%;left:48%;">
        <div class="spinner-layer spinner-blue-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle">
              </div>
            </div>
            <div class="circle-clipper right">
              <div class="circle">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 0px; z-index: -1;" id="further_ideas_card_div">
    <div class="card-panel col s12" style="height: calc(24vh); overflow: hidden; width: 100%;">
      <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Tag Lines</h5></div>
      <div id="tag_lines" style="height: calc(100% - 60px); overflow-y: scroll;">
      <div class="preloader-wrapper small active" style="top:40%;left:48%;">
        <div class="spinner-layer spinner-blue-only">
          <div class="circle-clipper left">
            <div class="circle"></div>
          </div>
          <div class="gap-patch">
            <div class="circle">
            </div>
          </div>
          <div class="circle-clipper right">
            <div class="circle">
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 0px; z-index: -1;" id="further_ideas_card_div">
    <div class="card-panel col s12" style="height: calc(24vh); overflow: hidden; width: 100%;">
      <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Retailers</h5></div>
      <div id="retailers" style="height: calc(100% - 60px); overflow-y: scroll;">
      <div class="preloader-wrapper small active" style="top:40%;left:48%;">
          <div class="spinner-layer spinner-blue-only">
            <div class="circle-clipper left">
              <div class="circle"></div>
            </div>
            <div class="gap-patch">
              <div class="circle">
              </div>
            </div>
            <div class="circle-clipper right">
              <div class="circle">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`

    get_result('price_point','text',title,description)
    get_result('product_details','bullet',title,description)
    get_result('tag_lines','bullet',title,description)
    get_result('roadmap','tick',title,description)
    get_result('retailers','bullet',title,description)

}

function load_explore_campaign_divs(title,description){

  industry = $('#industry_value').val();
  gender_el = $('#gender_select').val()

  if (gender_el !== null){
    gender = gender_el[0]
  } else {
    gender = null
  }
  age_el = $('#age_select').val()
  if (age_el !== null){
    age = age_el[0]
  } else {
    age = null
  }
  trend = $('#trend_select').val()

  var parent_div = document.getElementById("page_parent_div");
  parent_div.innerHTML = ''

  var chat_button = document.getElementById("chat-button");
  chat_button.style.display = "block";

  var chat_div = document.getElementById("messages-div");
  chat_div.innerHTML = `<div id="initial_message" class="message response-message"><p>Hi! I'm your personal marketing consultant for <b>`+ title +`</b>. What would you like to know?</p></div>`

  parent_div.innerHTML = `<div class="col s12" style="height:calc(17vh); padding:0px 10px 0px 10px; position: fixed; width: 100%; z-index:10;" id="ideas_card_div">
  <div class="card-panel col s12" style="height:calc(17vh); " id="ideas_div">
    <div class = "row">
      <div class="col s12" style="width:3%; margin-top:15px;"><i style="pointer-events:auto; cursor: pointer;" onClick="back()" class="material-icons">arrow_back</i></div>
      <div class="col s12" style="width:95%">
        <h4 style="margin-top:10px">`+title+`</h4>
      </div>
      <div class="col s12" style="font-size:20px; margin-left:3%;">`+description+`</div>
    </div>
  </div>
</div>
<div class="col s12" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: calc(17vh + 5px); z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(24vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Campaign Execution</h5></div>
    <div id="execution" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:48%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 0px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%; margin-top: 0px;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Tag Lines</h5></div>
    <div id="campaign_tag_lines" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="width:50%;height:calc(26vh); padding:0px 10px 0px 0px; margin-top: 0px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%; margin-top: 0px;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Tone of Voice</h5></div>
    <div id="tone" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 5px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Platforms</h5></div>
    <div id="platforms" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="width:50%;height:calc(26vh); padding:0px 10px 0px 0px; margin-top: 5px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Brand Partners</h5></div>
    <div id="brand_partners" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>`

  get_result('execution','tick',title,description,industry,age,gender,trend)
  get_result('campaign_tag_lines','bullet',title,description,industry,age,gender,trend)
  get_result('tone','text',title,description,industry,age,gender,trend)
  get_result('brand_partners','bullet',title,description,industry,age,gender,trend)
  get_result('platforms','nested_bullet',title,description,industry,age,gender,trend)

}

function load_explore_strategy_divs(title,description){

  industry = $('#industry_value').val();
  gender_el = $('#gender_select').val()

  if (gender_el !== null){
    gender = gender_el[0]
  } else {
    gender = null
  }
  age_el = $('#age_select').val()
  if (age_el !== null){
    age = age_el[0]
  } else {
    age = null
  }
  trend = $('#trend_select').val()

  var parent_div = document.getElementById("page_parent_div");
  parent_div.innerHTML = ''

  var chat_button = document.getElementById("chat-button");
  chat_button.style.display = "block";

  var chat_div = document.getElementById("messages-div");
  chat_div.innerHTML = `<div id="initial_message" class="message response-message"><p>Hi! I'm your personal business strategy consultant for <b>`+ title +`</b>. What would you like to know?</p></div>`

  parent_div.innerHTML = `<div class="col s12" style="height:calc(17vh); padding:0px 10px 0px 10px; position: fixed; width: 100%; z-index:10;" id="ideas_card_div">
  <div class="card-panel col s12" style="height:calc(17vh); " id="ideas_div">
    <div class = "row">
      <div class="col s12" style="width:3%; margin-top:15px;"><i style="pointer-events:auto; cursor: pointer;" onClick="back()" class="material-icons">arrow_back</i></div>
      <div class="col s12" style="width:95%">
        <h4 style="margin-top:10px">`+title+`</h4>
      </div>
      <div class="col s12" style="font-size:20px; margin-left:3%;">`+description+`</div>
    </div>
  </div>
</div>
<div class="col s12" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: calc(17vh + 5px); z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(24vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Strategy Vision</h5></div>
    <div id="vision" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:48%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s12" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 0px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%; margin-top: 0px;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Objectives</h5></div>
    <div id="objectives" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="width:50%;height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 5px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Value for Customers</h5></div>
    <div id="customer_value" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 5px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Required Resources and Capabilities</h5></div>
    <div id="resources_capabilities" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>`

  get_result('vision','bullet',title,description,industry,age,gender,trend)
  get_result('objectives','tick',title,description,industry,age,gender,trend)
  get_result('customer_value','bullet',title,description,industry,age,gender,trend)
  get_result('resources_capabilities','bullet',title,description,industry,age,gender,trend)

}

function load_explore_business_models_divs(title,description){

  industry = $('#industry_value').val();
  gender_el = $('#gender_select').val()

  if (gender_el !== null){
    gender = gender_el[0]
  } else {
    gender = null
  }
  age_el = $('#age_select').val()
  if (age_el !== null){
    age = age_el[0]
  } else {
    age = null
  }
  trend = $('#trend_select').val()

  var parent_div = document.getElementById("page_parent_div");
  parent_div.innerHTML = ''

  var chat_button = document.getElementById("chat-button");
  chat_button.style.display = "block";

  var chat_div = document.getElementById("messages-div");
  chat_div.innerHTML = `<div id="initial_message" class="message response-message"><p>Hi! I'm your personal business model consultant for <b>`+ title +`</b>. What would you like to know?</p></div>`

  parent_div.innerHTML = `<div class="col s12" style="height:calc(17vh); padding:0px 10px 0px 10px; position: fixed; width: 100%; z-index:10;" id="ideas_card_div">
  <div class="card-panel col s12" style="height:calc(17vh); " id="ideas_div">
    <div class = "row">
      <div class="col s12" style="width:3%; margin-top:15px;"><i style="pointer-events:auto; cursor: pointer;" onClick="back()" class="material-icons">arrow_back</i></div>
      <div class="col s12" style="width:95%">
        <h4 style="margin-top:10px">`+title+`</h4>
      </div>
      <div class="col s12" style="font-size:20px; margin-left:3%;">`+description+`</div>
    </div>
  </div>
</div>
<div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: calc(17vh + 10px); z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(24vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Value Propositions</h5></div>
    <div id="value_proposition" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:48%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: calc(17vh + 10px); z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(24vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Revenue Models</h5></div>
    <div id="revenue_model" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s12" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 0px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Competitors and Advanages</h5></div>
    <div id="competitors" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 10px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Target Demographic</h5></div>
    <div id="target_demographic" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>
<div class="col s6" style="height:calc(26vh); padding:0px 10px 0px 10px; margin-top: 10px; z-index: -1;" id="further_ideas_card_div">
  <div class="card-panel col s12" style="height: calc(26vh); overflow: hidden; width: 100%;">
    <div class="card-title left-align" style="position: sticky; border-bottom: 1px solid #ccc;"><h5>Target Market Size</h5></div>
    <div id="target_market_size" style="height: calc(100% - 60px); overflow-y: scroll;">
    <div class="preloader-wrapper small active" style="top:40%;left:45%;"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div>
    </div>
  </div>
</div>`

  get_result('value_proposition','bullet',title,description,industry,age,gender,trend)
  get_result('revenue_model','bullet',title,description,industry,age,gender,trend)
  get_result('competitors','nested_bullet',title,description,industry,age,gender,trend)
  get_result('target_demographic','bullet',title,description,industry,age,gender,trend)
  get_result('target_market_size','bullet',title,description,industry,age,gender,trend)

}

var results_dict = {}

function get_result(name,type,title,description,industry,age,gender,trend){

  data ={'detail':name,'title':title,'description':description,'industry':industry,'age':age,'gender':gender,'trend':trend}

  url = '/get_idea_details'
  
  fetchData(url, data)
  .then(responseData => {
    
        result_entry = responseData["result"]
        var div = document.getElementById(name);

        div.innerHTML = ''
        results_dict[name] = result_entry

        if (type == 'text'){
          div.innerHTML += '<div class="left-align" style="font-size: 16px; margin-top:5px;">'+ result_entry + '</div>'
        } else if (type=='nested_bullet'){
          full_s = ""
          full_s +='<div class="nested-list">'
          for (var i = 0; i < result_entry.length; i++) {
            entry = result_entry[i]
            s = '<ul><li>'+ entry[0] + '<ul><li>' + entry[1] +'</li></li></ul></ul>'
            full_s +=s
          }
          full_s +='</ul></div>'
          div.innerHTML += full_s
        } else {
          for (var i = 0; i < result_entry.length; i++) {
              e = result_entry[i]
              if (type == 'bullet'){
                div.innerHTML += '<li style="padding-bottom:5px;">' + e +'</li>'
              } else if (type == 'tick'){
                div.innerHTML += '<p><label><input type="checkbox" /><span>'+e+'</span></label></p>'
              }
          }
        }
    }
  )
  .catch(error => console.error('Failed to fetch data:', error));
  
}


function loadMore(){
  generate_ideas(false)
}

//Open Chat Modal
function openChat(){
  $('#chat-modal').modal('open');
}

//Add Message to Chat
function addMessage(text, className) {

  const message = document.createElement("div");
  message.classList.add("message", className);
  const messageText = document.createElement("p");
  messageText.innerText = text;
  message.appendChild(messageText);
  chatMessages.appendChild(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;

}

//Get chat response to user message
function sendChatRequest(userMessage) {

  const textbox = document.getElementById("chat-input");
  textbox.disabled = true;
  textbox.blur();

  const chatLoader = document.getElementById("chat_loader_div");
  chatLoader.style.display = "block";

  const parentDiv = document.getElementById('messages-div');
  const childP = parentDiv.querySelectorAll('div > p');
  const childDivs = parentDiv.querySelectorAll('div');

  const textArray = Array.from(childP).map(p => p.textContent);
  const classArray = Array.from(childDivs).map(div => div.className);

  url = '/getChatResponse'
  data = {'context':results_dict,'messages':textArray,'roles':classArray,'idea_type':idea_tmp}

  fetchData(url, data, timeout)
  .then(responseData => {

    response = responseData["response"]
    addMessage(response, "response-message");
    textbox.disabled = false
    textbox.focus();
    chatLoader.style.display = "none";

  }).catch(error => console.error('Failed to fetch data:', error));

}