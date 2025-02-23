{{
function collectBody(members) {
  const result = {
    properties: [],
    data: null,
    highlights: [],
    areaFills: [],
    annotations: [],
    series: [],
    steps: [],
  };
  for (const m of members) {
    switch (m.type) {
      case 'property':  result.properties.push(m); break;
      case 'data':       result.data = m;           break;
      case 'highlight':  result.highlights.push(m); break;
      case 'areafill':   result.areaFills.push(m);  break;
      case 'annotation': result.annotations.push(m);break;
      case 'series':     result.series.push(m);     break;
      case 'step':       result.steps.push(m);      break;
    }
  }
  return result;
}

function collectStepBody(members) {
  const result = {
    properties: [],
    data: null,
    highlights: [],
    areaFills: [],
    annotations: [],
  };
  for (const m of members) {
    switch (m.type) {
      case 'property':  result.properties.push(m); break;
      case 'data':       result.data = m;           break;
      case 'highlight':  result.highlights.push(m); break;
      case 'areafill':   result.areaFills.push(m);  break;
      case 'annotation': result.annotations.push(m);break;
    }
  }
  return result;
}
}}

Chart
  = _ "chart" __ chartType:Identifier _ "{" _ members:ChartMember* _ "}" _
  {
    const body = collectBody(members);
    return {
      type: 'chart',
      chartType,
      properties: body.properties,
      data: body.data,
      highlights: body.highlights,
      areaFills: body.areaFills,
      annotations: body.annotations,
      series: body.series,
      steps: body.steps,
    };
  }

ChartMember
  = _ m:(DataBlock / Highlight / AreaFill / Annotation / Series / Step / Property) _
  { return m; }

DataBlock
  = "data" _ "{" _ entries:DataEntry* _ "}"
  { return { type: 'data', entries }; }

DataEntry
  = _ p:Property _ { return p; }

Highlight
  = "highlight" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'highlight', target, properties: props }; }

AreaFill
  = "areafill" __ from:String __ to:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'areafill', from, to, properties: props }; }

Annotation
  = "annotation" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'annotation', target, properties: props }; }

Series
  = "series" __ name:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'series', name, properties: props }; }

Step
  = "step" __ name:String _ "{" _ members:StepMember* _ "}"
  {
    const body = collectStepBody(members);
    return {
      type: 'step',
      name,
      properties: body.properties,
      data: body.data,
      highlights: body.highlights,
      areaFills: body.areaFills,
      annotations: body.annotations,
    };
  }

StepMember
  = _ m:(DataBlock / Highlight / AreaFill / Annotation / Property) _
  { return m; }

BlockProperty
  = _ p:Property _ { return p; }

Property
  = key:PropertyKey _ "=" _ value:PropertyValue
  { return { type: 'property', key, value: value.value, isPercentage: value.isPercentage }; }

PropertyKey
  = String / Identifier

PropertyValue
  = n:Number "%" { return { value: n, isPercentage: true }; }
  / n:Number     { return { value: n, isPercentage: false }; }
  / s:String     { return { value: s, isPercentage: false }; }
  / id:Identifier { return { value: id, isPercentage: false }; }

Identifier "identifier"
  = $([a-zA-Z_#] [a-zA-Z0-9_#-]*)

Number
  = digits:$("-"? [0-9]+ ("." [0-9]+)?) { return parseFloat(digits); }

String "string"
  = '"' chars:StringChar* '"' { return chars.join(''); }

StringChar
  = '\\' c:EscapeChar { return c; }
  / [^"\\]

EscapeChar
  = '"'  { return '"'; }
  / '\\' { return '\\'; }
  / 'n'  { return '\n'; }
  / 't'  { return '\t'; }
  / c:.  { return c; }

__ "whitespace"
  = [ \t\n\r]+

_ "optional whitespace"
  = [ \t\n\r]*
