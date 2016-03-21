// use ReactJS components ONLY FOR RENDERING
//
// terminology:
//
// * component -- contains a rendering, delegates user actions to the controller
// * rendering -- the output of React components' rendering, based on templates
//   in the render methods
// * view -- the data structure from which React components' compute the rendering
// * controller -- handles events from its matching React component and updates the view
//
// the entire app is a hierarchy; each node in the hierarchy corresponds to a
// component; each component has a view it has to render, and an accompanying
// controller it sends its events to.  regular components delegate all state
// management to their controller; only ephemeral subcomponents are allowed to
// be treated as black boxes with their private internal state, whose only
// output is their result, but that result is then recorded as an event in the
// parent component and sent to the controller anyway.
//
// therefore state is only ever bubbled up the hierarchy to the nearest
// non-ephemeral component. also, ephemeral components are often "promoted" to
// proper components that participate in the hierarchy directly, in which case
// it is allotted a place in the hierarchy and assigned a view and controller.

var BG_ALL = [
  "tallinn", 
  "paris",
  "bridge",
];

var NICE_WHITE_BG = "rgba(255,255,255,0.5)";
var NICE_WHITE_BG2 = "rgba(255,255,255,0.7)";

var SelectBox = React.createClass({
  getInitialState: function() { return {isModifying: false}; },

  onBeginSelection: function(e) { this.setState({isModifying: true}); },
  onEndSelection  : function(e) { this.setState({isModifying: false}); },

  onPickerYield: function(values) {
    console.debug(values);
    this.props.onYield(values);
    // this.setState({selected: values});
  },
  render: function() {
    var picker = (
        <SelectPicker
          selected={this.props.selected} all={this.props.all}
          onYield={this.onPickerYield}
          onDone={this.onEndSelection}
        />
    );
    var itemStyle = {
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      border:"1px solid white",
      borderRadius:"50%",
      width: "28px", height: "28px", margin: "4px"
    };
    var selectedItems = this.props.selected.map(
      x => <img style={itemStyle} key={x.key} alt={x.label} src={x.iconUri()} />
    );

    return (
        <div className="select-box" style={{position: "relative"}}>
          <div style={{position: "absolute", zIndex: navigator.platform === "iPhone" ? -1 : 2, opacity: navigator.platform === "iPhone" ? 0.0 : 1.0}}>
            {this.state.isModifying ? picker : null}
          </div>
          <div style={{position: "absolute", zIndex:  1, width: "100%"}} onClick={this.onBeginSelection}>
            {selectedItems}
          </div>
        </div>
    );
  }
});


var SelectPicker = React.createClass({
  componentDidMount: function() { this.refs.select.focus(); },
  isSelected: function(key) { return this.props.selected.some(x => x.key === key); },
  onChange: function(e) {
    var vals = ($(e.target).val() || []).map(key => this.props.all.find(x => x.key === key));
    console.debug("SelectPicker.onChange: ", vals);
    this.props.onYield(vals);
  },
  render: function() {
    var options = this.props.all.map(
      ({key,label}) => <option key={key} value={key}>{label}</option>
    );
    // XXX: the dummy optgroup is needed; otherwise iOS safari auto-unselects the first value for some reason
    return (
        <select style={{appearance: "none"}} ref="select" value={this.props.selected.map(x => x.key)} onChange={this.onChange} className="select-picker" multiple="multiple" onBlur={this.props.onDone}>
          <optgroup disabled></optgroup>
          {options}
        </select>
    );
  }
});


//////////////////////////

var Search = React.createClass({
  getInitialState: function() {
    return {
      langs: ["en", "et"].map(x => _LANG_ALL_LOOKUP[x]),
      topics: ["history", "architecture"].map(x => _TOPIC_ALL_LOOKUP[x])
    };
  },
  style: { height: "100%", position: "relative" },
  bgStyle: {
    backgroundImage: "url(img/bg_" + BG_ALL[(new Date()).getMinutes() % BG_ALL.length] + ".jpg)",
    backgroundPosition: "center center", backgroundSize: "auto 100%", backgroundRepeat: "no-repeat",
    WebkitFilter: "blur(4px)",

    position: "fixed", left: 0, right: 0, top: 0, bottom: 0, zIndex: 1
  },
  contentStyle: {
    position: "fixed", left: 0, right: 0, zIndex: 9999
  },

  onTopicSelectionChange: function(xs) {
    var overSize = Math.max(0, xs.length - 4);
    this.setState({topics: xs.slice(overSize)});
  },
  onLangSelectionChange : function(xs) {
    var overSize = Math.max(0, xs.length - 4);
    this.setState({langs: xs.slice(overSize)});
  },

  render: function() {
    var currWday = ["sun","mon","tue","wed","thu","fri","sat"][(new Date()).getDay()];
    return (
      <div className="search" style={this.style}>
        <div style={this.bgStyle}></div>
        <div style={this.contentStyle}>
          <div style={{background:"-webkit-linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0))"}}>
            <img style={{margin:"5px 0 0px 10px"}} src="img/guideme_takemeonatour.png"/>
          </div>
          <div style={{position:"relative"}}>
            <div style={{position: "absolute", left: "0px", right: "50.4%", backgroundColor:NICE_WHITE_BG2, boxSizing:"border-box", height:"70px", padding:"7px",borderRadius:"0 0 20px 0"}}>
              <div style={{fontSize:"10px",lineHeight:"21px",height:"21px",backgroundImage:"url(img/confsliders.png)",backgroundRepeat:"no-repeat",paddingLeft:"23px",backgroundPosition:"3px 3px",backgroundSize:"14px 14px"}}>I WANT A GUIDE AT...</div>
              <div style={{background: "rgba(100,220,140,0.2) url(img/currloc.png) no-repeat",backgroundPosition:"10px center",backgroundSize:"12px 12px",display:"inline-block",margin:"5px 0 0 5px",padding:"1px 10px 1px 27px",border:"1px solid white",borderRadius:"15px",fontSize:"10px",textTransform:"uppercase"}}>my current location</div>
            </div>
            <div style={{position: "absolute", left: "50.4%", right: "0px", backgroundColor:NICE_WHITE_BG2, boxSizing:"border-box", height:"70px", padding:"7px"}}>
              <div style={{fontSize:"10px",lineHeight:"21px",height:"21px",backgroundImage:"url(img/confsliders.png)",backgroundRepeat:"no-repeat",paddingLeft:"23px",backgroundPosition:"3px 3px",backgroundSize:"14px 14px"}}>SOMETIME DURING...</div>
              <div style={{background: "rgba(100,220,140,0.2) url(img/cal.png) no-repeat",backgroundPosition:"10px center",backgroundSize:"12px 12px",display:"inline-block",margin:"5px 0 0 5px",padding:"1px 10px 1px 27px",border:"1px solid white",borderRadius:"15px",fontSize:"10px",textTransform:"uppercase"}}>today &ndash; next {currWday}</div>
            </div>
            <div style={{position: "absolute", left: "0px", right: "50.4%", top:"73px", backgroundColor:NICE_WHITE_BG2, boxSizing:"border-box", height:"70px", padding:"7px"}}>
              <div style={{fontSize:"10px",lineHeight:"21px",height:"21px",backgroundImage:"url(img/confsliders.png)",backgroundRepeat:"no-repeat",paddingLeft:"23px",backgroundPosition:"3px 3px",backgroundSize:"14px 14px"}}>YOUR LANGUAGES</div>
              <SelectBox selected={this.state.langs}  all={LANG_ALL}  onYield={this.onLangSelectionChange} />
            </div>
            <div style={{position: "absolute", left: "50.4%", right: "0px", top:"73px", backgroundColor:NICE_WHITE_BG2, boxSizing:"border-box", height:"70px", padding:"7px",borderRadius:"20px 0 0 0"}}>
              <div style={{fontSize:"10px",lineHeight:"21px",height:"21px",backgroundImage:"url(img/confsliders.png)",backgroundRepeat:"no-repeat",paddingLeft:"23px",backgroundPosition:"3px 3px",backgroundSize:"14px 14px"}}>YOUR INTERESTS</div>
              <SelectBox selected={this.state.topics} all={TOPIC_ALL} onYield={this.onTopicSelectionChange} />
            </div>
            <div style={{position: "absolute", top: "145px", width: "100%"}}>
              <SearchResults items={[]} />
            </div>
          </div>
            <div style={{position:"fixed",left:0,right:0,bottom:0,height:"40px",textAlign:"center",paddingTop:"12px",backgroundColor:"rgba(255,206,81,0.9)"}}>
              <LittleGreenBtn label="hmm... just figure out what I like" iconUrl="img/qmark3.png" backgroundColor="#99FFC0"/>
            </div>
        </div>
      </div>
    );
  }
});

var SearchResults = React.createClass({
  itemStyle: {height:"105px", backgroundColor:NICE_WHITE_BG, lineHeight:"1em", overflow:"hidden", position:"relative", margin:"1px"},
  render: function() {
    var certificationBadge = <div style={{zIndex:1000,position:"absolute",top:"22px",left:"110px",width:"60px",height:"48px",transform:"rotate(19deg)",opacity:"0.6",backgroundImage:"url(img/certified.png)", backgroundSize:"60px 48px", backgroundPosition:"center center",backgroundRepeat:"no-repeat"}}></div>;
    var items = GUIDES_ALL.map(x => {
      return (
          <div key={x.id} style={this.itemStyle}>
            {x.isCertified() ? certificationBadge : null}
            <div style={{position: "absolute", left:"10px",top:"20px"}}>
              <img src={x.profilePhoto} style={{borderRadius:"50%",display:"block", width: "55px", height: "55px", marginBottom:"5px"}} />
            </div>
            <div style={{position: "absolute", left:"80px", top:"10px", fontSize:"11px",textTransform:"uppercase"}}>
              {
                x.certifications.length === 0 
                  ? "tour guide" : x.certifications.map(
                    x => x.type === "certified" ? "certified by " + x.by : x.type === "featured" ? "featured today" : x.type
                  )
              }
            </div>
            <div style={{position: "absolute", left:"80px", top:"26px", fontWeight:"bold"}}>
              {x.name}
            </div>
            <div style={{position: "absolute", left:"80px", top:"45px", fontSize:"10px"}}>
              {x.locations.join(" / ")}
            </div>
            <div style={{position: "absolute", left:"80px", top:"62px", fontSize:"15px",fontWeight:"bold",padding:"6px",backgroundColor:"#FF99C0",borderRadius:"3px",width:"30px",textAlign:"center"}}>
              {x.rating}
            </div>
            <div style={{position: "absolute", left:"127px", top:"62px", fontSize:"10px", paddingTop:"10px"}}>
              {x.numStories} traveller stories
            </div>
            <div style={{position:"absolute",right:"20px", top:"62px"}}>
              <LittleGreenBtn label="ping" iconUrl="img/bell.png" backgroundColor="#99FFC0"/>
            </div>
          </div>
      );
    });
    return (
        <div style={{left: 0, right: 0}}>
          {items}
        </div>
    );
  }
});

var LittleGreenBtn = React.createClass({
  getInitialState: function() { return {pressed:false}; },
  render: function() {
      return (
          <div
            onTouchStart={this.onTouchStart} 
            onMouseDown={this.onTouchStart}
            onTouchEnd={this.onTouchEnd}
            onMouseOut={this.onTouchEnd}
            onMouseUp={this.onTouchEnd}
            style={{border:"2px solid rgb(254,255,240)", WebkitUserSelect: "none", textAlign:"left", fontSize:"11px",textTransform:"uppercase",
                    padding:"4px 5px 4px 5px",borderRadius:"3px", display:"inline-block",
                    background: this.props.backgroundColor + " url("+this.props.iconUrl+") no-repeat",backgroundOrigin:"content-box",backgroundPosition:"right center",backgroundSize:"13px 13px",
                    WebkitFilter: this.state.pressed ? "invert(15%)" : "invert(0%)"
                   }}
          >
            <div style={{paddingRight:"18px"}}>{this.props.label}</div>
          </div>
      );
  },
  onTouchStart: function(e) { this.setState({pressed:true}); },
  onTouchEnd:  function(e) { this.setState({pressed:false}); }
});

///////////////////////////

function intercalate(sep, xs) { 
  if (xs.length === 0) return [];
  return xs.slice(1).reduceRight((acc, x) => acc.concat([sep]).concat(x), [xs[0]]);
}

function mapFromList(xs) { return xs.reduce((acc, y) => { acc[y[0]] = y[1]; return acc; }, {}); }

//////////////////////////

function Language(attrs) { Object.assign(this, attrs); }
Language.prototype = {
  iconUri: function() {
    return this.iconUriWithGeom({w:128,h:128});
  },
  iconUriWithGeom: function(geom) {
    return ("img/lang_" + this.key + "_" + this.ctryCodes.join('+')
            + "_" + geom.w+"x"+geom.h + ".png");
  }
}

var LANG_ALL = [
  {key: "en", ctryCodes: ["us", "uk"], label: "English"},
  {key: "et", ctryCodes: ["ee"],       label: "Eesti keel"},
  {key: "fi", ctryCodes: ["fi"],       label: "Suomi"},
  {key: "ru", ctryCodes: ["rf"],       label: "Ру́сский"},
  {key: "sw", ctryCodes: ["se"],       label: "Svenska"},
  {key: "de", ctryCodes: ["de"],       label: "Deutsch"},
  {key: "fr", ctryCodes: ["fr"],       label: "Français"},
  {key: "es", ctryCodes: ["es"],       label: "Español"},
  {key: "it", ctryCodes: ["it"],       label: "Italiano"},
  {key: "pt", ctryCodes: ["pt", "br"],       label: "Português"},
].map(x => new Language(x));

var _LANG_ALL_LOOKUP = mapFromList(
  LANG_ALL.map(x => [x.key, x])
);


function Topic(attrs) { Object.assign(this, attrs); }
Topic.prototype = {
  iconUri: function() {
    return this.iconUriWithGeom({w:128,h:128});
  },
  iconUriWithGeom: function(geom) {
    return ("img/topic_" + this.key
            + "_" + geom.w+"x"+geom.h + ".png");
  }
}

var TOPIC_ALL = [
  {key: "history",               label: "History"},
  {key: "architecture",          label: "Architecture"},
  {key: "sightseeing",           label: "Sightseeing"},
  {key: "pubsAndBars",           label: "Pubs & Bars"},
  {key: "diningAndRestaurants",  label: "Dining & Restaurants"},
  {key: "beer",                  label: "Beer"},
  {key: "wine",                  label: "Wine"},
  {key: "parksAndWildlife",      label: "Parks & Wildlife"},
  {key: "outdoorAndActivities",  label: "Outdoor & Activites"},
].map(x => new Topic(x));
var _TOPIC_ALL_LOOKUP = mapFromList(
  TOPIC_ALL.map(x => [x.key, x])
);


function Guide(attrs) { Object.assign(this, attrs); }
Guide.prototype = {
  isCertified: function() { return this.certifications.some(x => x.type === "certified"); }
};
var GUIDES_ALL = [
  {
    id: "siim" , name: "Siim" , locations: ["Tallinn"],
    certifications: [
      {type:"certified",by:"Estonian Assoc. of Tourist Guides"}
    ],
    rating: "9.8",
    numStories: 7,
    profilePhoto: "img/profile-photos/siim.jpg"
  },
  {
    id: "timo" , name: "Timo" , locations: ["Tallinn","Helsinki"],
    certifications: [],
    rating: "9.3",
    numStories: 5,
    profilePhoto: "img/profile-photos/timo-maakler.jpg"
  },
  {
    id: "kaiko", name: "Kaiko", locations: ["Viljandi","Tallinn"],
    certifications: [
      {type:"featured"}
    ],
    rating: "9.2",
    numStories: 2,
    profilePhoto: "img/profile-photos/kaiko.jpg"
  },
  {
    id: "erik" , name: "Erik" , locations: ["Tallinn"],
    certifications: [],
    rating: "8.7",
    numStories: 4,
    profilePhoto: "img/profile-photos/erik-kilpkonn.jpg"
  },
].map(x => new Guide(x));


window.Search = Search;

window.LANG_ALL = LANG_ALL;
window._LANG_ALL_LOOKUP = _LANG_ALL_LOOKUP;
window.GUIDES_ALL = GUIDES_ALL;
