{{
function countDataBlocks(members) {
  let n = 0;
  for (const m of members) {
    if (m.type === 'data') n++;
  }
  return n;
}

function collectBody(members) {
  const result = {
    properties: [],
    data: null,
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],
    annotationVisibility: [],
    series: [],
    scenes: [],
    transforms: [],
  };
  for (const m of members) {
    switch (m.type) {
      case 'property':  result.properties.push(m); break;
      case 'data':      result.data = m; break;
      case 'colorize':   result.colorizes.push(m);  break;
      case 'highlight':  result.highlights.push(m); break;
      case 'area-fill':  result.areaFills.push(m);  break;
      case 'annotation': result.annotations.push(m);break;
      case 'annotation-visibility': result.annotationVisibility.push(m); break;
      case 'series':     result.series.push(m);     break;
      case 'scene':      result.scenes.push(m);     break;
      case 'transform':  result.transforms.push(m); break;
    }
  }
  return result;
}

function collectSceneBody(members) {
  const result = {
    properties: [],
    data: null,
    colorizes: [],
    highlights: [],
    areaFills: [],
    annotations: [],
    annotationVisibility: [],
    series: [],
    transforms: [],
  };
  for (const m of members) {
    switch (m.type) {
      case 'property':  result.properties.push(m); break;
      case 'data':      result.data = m; break;
      case 'colorize':   result.colorizes.push(m);  break;
      case 'highlight':  result.highlights.push(m); break;
      case 'area-fill':  result.areaFills.push(m);  break;
      case 'annotation': result.annotations.push(m);break;
      case 'annotation-visibility': result.annotationVisibility.push(m); break;
      case 'series':     result.series.push(m);     break;
      case 'transform':  result.transforms.push(m); break;
    }
  }
  return result;
}
}}

Chart
  = _ "chart" __ chartType:Identifier _ "{" members:ChartMember* _ "}" _
  {
    if (countDataBlocks(members) > 1) {
      error('duplicate data block — a chart or scene may define at most one data { } block');
    }
    const body = collectBody(members);
    return {
      type: 'chart',
      chartType,
      properties: body.properties,
      data: body.data,
      colorizes: body.colorizes,
      highlights: body.highlights,
      areaFills: body.areaFills,
      annotations: body.annotations,
      annotationVisibility: body.annotationVisibility,
      series: body.series,
      scenes: body.scenes,
      transforms: body.transforms,
    };
  }

ChartMember
  = comments:LeadingComments m:(DataBlock / Colorize / Highlight / AreaFill / RangeAnnotation / NoteAnnotation / Annotation / HideAnnotation / HideRange / HideNote / ShowAnnotation / ShowRange / ShowNote / Series / Scene / Transform / Property) [ \t]* LineComment? S
  { if (comments.length) m.leadingComments = comments; return m; }

DataBlock
  = "data" _ "{" entries:DataMember* _ "}"
  { return { type: 'data', entries }; }

DataMember
  = comments:LeadingComments e:(TabularDataEntry / DataEntry) [ \t]* LineComment? S
  { if (comments.length) e.leadingComments = comments; return e; }

DataEntry
  = key:DataKey _ "=" _ first:PropertyValue rest:("," _ v:PropertyValue { return v; })+
  {
    const all = [first, ...rest];
    // quotedKey distinguishes a real data row labelled "series" (quoted) from
    // the unquoted `series = ...` meta-row that names the columns.
    return { type: 'property', key: key.name, ...(key.quoted && key.name === 'series' ? { quotedKey: true } : {}), value: all[0].value, isPercentage: false, values: all.map(v => v.value) };
  }
  / key:DataKey _ "=" _ value:PropertyValue
  { return { type: 'property', key: key.name, ...(key.quoted && key.name === 'series' ? { quotedKey: true } : {}), value: value.value, isPercentage: value.isPercentage }; }

DataKey
  = s:String { return { name: s, quoted: true }; }
  / i:Identifier { return { name: i, quoted: false }; }

TabularDataEntry
  = label:TabularLabel "\t" _ value:PropertyValue
  { return { type: 'property', key: label, ...(label === 'series' ? { quotedKey: true } : {}), value: value.value, isPercentage: value.isPercentage }; }

TabularLabel
  = chars:$([^\t\n\r{}=]+) { return chars.trim(); }

Colorize
  = "colorize" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'colorize', target, properties: props }; }
  / "colorize" _ "{"
  { error('colorize needs a quoted target, e.g. colorize "2021" { ... }'); }

Highlight
  = "highlight" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'colorize', target, properties: props, fromHighlight: true }; }
  / "highlight" __ target:String !(_ "{")
  { return { type: 'highlight', target, properties: [] }; }
  / "highlight" _ "{"
  { error('highlight needs a quoted target, e.g. highlight "2021" { ... } or highlight "2021"'); }

AreaFill
  = "area-fill" __ from:String __ to:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'area-fill', from, to, properties: props }; }
  / "area-fill" __ String _ "{"
  { error('area-fill needs two quoted targets, e.g. area-fill "Revenue" "Cost" { ... }'); }
  / "area-fill" _ "{"
  { error('area-fill needs two quoted targets, e.g. area-fill "Revenue" "Cost" { ... }'); }

Annotation
  = "annotation" __ target:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'annotation', kind: 'point', target, properties: props }; }
  / "annotation" _ "{"
  { error('annotation needs a quoted target, e.g. annotation "2021" { ... }'); }

RangeAnnotation
  = "range" _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'annotation', kind: 'range', properties: props }; }

NoteAnnotation
  = "note" _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'annotation', kind: 'free', properties: props }; }

Series
  = "series" __ name:String _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'series', name, properties: props }; }
  / "series" _ "{"
  { error('series needs a quoted name, e.g. series "Revenue" { ... }'); }

Scene
  = "scene" __ name:String? _ "{" members:SceneMember* _ "}"
  {
    if (countDataBlocks(members) > 1) {
      error('duplicate data block — a chart or scene may define at most one data { } block');
    }
    const body = collectSceneBody(members);
    return {
      type: 'scene',
      name: name ?? null,
      properties: body.properties,
      data: body.data,
      colorizes: body.colorizes,
      highlights: body.highlights,
      areaFills: body.areaFills,
      annotations: body.annotations,
      annotationVisibility: body.annotationVisibility,
      series: body.series,
      transforms: body.transforms,
    };
  }

Transform
  = "transform" __ transformType:Identifier _ "{" _ props:BlockProperty* _ "}"
  { return { type: 'transform', transformType, properties: props }; }

HideAnnotation
  = "hide-annotation" __ id:String
  { return { type: 'annotation-visibility', action: 'hide', kind: 'point', id }; }

HideRange
  = "hide-range" __ id:String
  { return { type: 'annotation-visibility', action: 'hide', kind: 'range', id }; }

HideNote
  = "hide-note" __ id:String
  { return { type: 'annotation-visibility', action: 'hide', kind: 'free', id }; }

ShowAnnotation
  = "show-annotation" __ id:String
  { return { type: 'annotation-visibility', action: 'show', kind: 'point', id }; }

ShowRange
  = "show-range" __ id:String
  { return { type: 'annotation-visibility', action: 'show', kind: 'range', id }; }

ShowNote
  = "show-note" __ id:String
  { return { type: 'annotation-visibility', action: 'show', kind: 'free', id }; }

SceneMember
  = comments:LeadingComments m:(DataBlock / Colorize / Highlight / AreaFill / RangeAnnotation / NoteAnnotation / Annotation / HideAnnotation / HideRange / HideNote / ShowAnnotation / ShowRange / ShowNote / Series / Transform / Property) [ \t]* LineComment? S
  { if (comments.length) m.leadingComments = comments; return m; }

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
  = digits:$("-"? ("." [0-9]+ / [0-9]+ ("." [0-9]*)?) ([eE] [+-]? [0-9]+)?) { return parseFloat(digits); }

String "string"
  = '"' chars:StringChar* '"' { return chars.join(''); }

StringChar
  = '\\' c:EscapeChar { return c; }
  / [^"\\]

EscapeChar
  = '"'  { return '"'; }
  / '\\' { return '\\'; }
  / 'n'  { return '\n'; }
  / 'r'  { return '\r'; }
  / 't'  { return '\t'; }
  / 'u' hex:$([0-9a-fA-F][0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]) { return String.fromCharCode(parseInt(hex, 16)); }
  / c:.  { error("Unknown escape sequence \\" + c); }

Comment
  = LineComment
  / BlockComment

LineComment
  = "//" [^\n]*

BlockComment
  = "/*" (!"*/" .)* "*/"

S "blank space"
  = [ \t\n\r]*

LeadingComments
  = list:(S c:CommentText { return c; })* S { return list; }

CommentText
  = "//" text:$([^\n]*)            { return text.trim(); }
  / "/*" text:$((!"*/" .)*) "*/"   { return text.trim(); }

__ "whitespace"
  = ([ \t\n\r] / Comment)+

_ "optional whitespace"
  = ([ \t\n\r] / Comment)*
