import { canonical } from '../../src/persistence/ledger';
import { parseCheckpointRef, createCheckpointRef } from '../../src/persistence/checkpoint-ref';
import { createHash } from 'node:crypto';

const vectors={"positive":[{"name":"G","bytes":674,"hash":"2cc2fc76288b28836a4e27aefad9b454e2ea886683bedd86415c860e767b9584","reference":{"checkpointIndex":"0","cursorHash":"b611d0187ccdd1007a0b5fb704b21f453fb633e9862df770ce8a0f68dff375a2","eventSeq":"2","format":"REF1","genesisHash":"d089cb74071deae55c8646d54757775fb6f1c5af77265fe4a8eba3d3679ef11f","kind":"GENESIS","operationId":"genesis","prefixHash":"9b237d56e4e29da5aa2150c0a0db4a4eb824f17269da363f51f413ebb2f25dc6","previousRefHash":"0000000000000000000000000000000000000000000000000000000000000000","receiptHash":"b22bcb86a315c1f32a3d68d22ecf436a5098f0fba41821f536eacb1306c29cf7","revision":"0","simulationId":"ref1-sim","stateHash":"331abc61907773ff9eb146ad0fa4ab6a2bb83fb7557bed7071b5747ac3d2dab7","hash":"2cc2fc76288b28836a4e27aefad9b454e2ea886683bedd86415c860e767b9584"}},{"name":"C1","bytes":667,"hash":"05e4c9078b36dd5b33ba4bc4bb987726aa8e2e2518cf16d6885f4240a19519fc","reference":{"checkpointIndex":"1","cursorHash":"84949046b531171471c6f4169ba86671fe1168ccbcd1c7d124c4ca7f9dfac089","eventSeq":"8","format":"REF1","genesisHash":"d089cb74071deae55c8646d54757775fb6f1c5af77265fe4a8eba3d3679ef11f","kind":"CLOSE","operationId":"c1","prefixHash":"3eccb8126ec53dd37bc0e0a2d6833c7eeab80b72c3b8ce2dd29a419e10e216c4","previousRefHash":"2cc2fc76288b28836a4e27aefad9b454e2ea886683bedd86415c860e767b9584","receiptHash":"6d801ffa2d753e5e1c71676cd1fc8e390d2a1cccad1799f98a873a024e233c9c","revision":"3","simulationId":"ref1-sim","stateHash":"86c93e989caa992c3b92912f7ce2013996186b92ff78e35e6136905331dc3d96","hash":"05e4c9078b36dd5b33ba4bc4bb987726aa8e2e2518cf16d6885f4240a19519fc"}},{"name":"C2","bytes":668,"hash":"6a2b44e6401ba0c7baee819e3b5568a41f2640fe6e973f92ca31cadae04f917f","reference":{"checkpointIndex":"2","cursorHash":"3a5141da6153d7e52ba763db522ba5c0fb68962ecd7de569bf259d2984a0a012","eventSeq":"14","format":"REF1","genesisHash":"d089cb74071deae55c8646d54757775fb6f1c5af77265fe4a8eba3d3679ef11f","kind":"CLOSE","operationId":"c2","prefixHash":"c6fff9b78c181486d0c171ec6393e34d281d95abead1856787665a13ebaca6d5","previousRefHash":"05e4c9078b36dd5b33ba4bc4bb987726aa8e2e2518cf16d6885f4240a19519fc","receiptHash":"354b3cb351186196870bd5802ae07b7ad65b86cc6b9784ea085b9cd30e0e35ed","revision":"6","simulationId":"ref1-sim","stateHash":"52f606fd4595bd88aba1e7f458d26d63d9badd1975422c8a50439a321453c067","hash":"6a2b44e6401ba0c7baee819e3b5568a41f2640fe6e973f92ca31cadae04f917f"}}],"negative":[{"field":"eventSeq","value":"9","hash":"94c4b73d927505d324d13a735858aa9bf2dadad452bdd6e091ae51532dd1ef57"},{"field":"simulationId","value":"other-sim","hash":"45998202bbc9b2d32379d0979e4c583380bb029535d6af0fdfa1b5c9f460b2ef"},{"field":"stateHash","value":"ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff","hash":"19533d27fc415f06fa29f0a6d26d9381bb28dfbc7edbab472a671c4190e4e15e"}]};

function digest(body:object):string {return createHash('sha256').update(canonical({domain:'BOT-CRYPTO:CHECKPOINT:REF1',reference:body})).digest('hex');}
test.each(vectors.positive)('normative $name reference and canonical UTF8',v=>{
 const r=parseCheckpointRef(canonical(v.reference));expect(r).toEqual(v.reference);expect(Object.isFrozen(r)).toBe(true);
 const {hash,...body}=r;expect(digest(body)).toBe(v.hash);expect(Buffer.byteLength(canonical({domain:'BOT-CRYPTO:CHECKPOINT:REF1',reference:body}))).toBe(v.bytes);
 expect(parseCheckpointRef(Buffer.from(canonical(r)))).toEqual(r);
});
test.each(vectors.negative)('negative hash $field is reproduced independently but differs from the genuine reference',v=>{
 const {hash,...body}=vectors.positive[1]!.reference,changed={...body,[v.field]:v.value};expect(digest(changed)).toBe(v.hash);
 expect(()=>parseCheckpointRef(canonical({...changed,hash}))).toThrow();
 expect(parseCheckpointRef(canonical({...changed,hash:v.hash}))).not.toEqual(vectors.positive[1]!.reference);
});
test.each(['extra','missing','null','number','array','duplicate','order','whitespace','BOM','escape','utf8','hash','overflow','zero-seq','leading-zero','invalid-id','uppercase-hash','wrong-kind','wrong-format','genesis-link'])('rejects invalid %s before writes',kind=>{
 const r:any=structuredClone(vectors.positive[0]!.reference);let text:string|Uint8Array;
 if(kind==='extra')r.extra='x';if(kind==='missing')delete r.kind;if(kind==='null')r.kind=null;if(kind==='number')r.revision=0;
 if(kind==='array')r.kind=[];if(kind==='hash')r.hash='0'.repeat(64);if(kind==='overflow')r.revision='9223372036854775808';
 if(kind==='zero-seq')r.eventSeq='0';if(kind==='leading-zero')r.checkpointIndex='00';if(kind==='invalid-id')r.simulationId='bad id';
 if(kind==='uppercase-hash')r.stateHash='A'.repeat(64);if(kind==='wrong-kind')r.kind='OPEN';if(kind==='wrong-format')r.format='REF2';if(kind==='genesis-link')r.previousRefHash='f'.repeat(64);
 text=canonical(r);if(kind==='duplicate')text=text.replace('{','{"kind":"GENESIS",');if(kind==='order')text=JSON.stringify(Object.fromEntries(Object.entries(r).reverse()));
 if(kind==='whitespace')text+=' ';if(kind==='BOM')text='\uFEFF'+text;if(kind==='escape')text=text.replace('REF1','\\u0052EF1');if(kind==='utf8')text=new Uint8Array([255]);
 expect(()=>parseCheckpointRef(text)).toThrow();
});
test('REF1 rejects non-object roots, non-text inputs and noncanonical decimal fields',()=>{
 for(const text of ['null','[]','true','1'])expect(()=>parseCheckpointRef(text)).toThrow();
 expect(()=>parseCheckpointRef(1 as never)).toThrow();
 for(const field of ['checkpointIndex','revision','eventSeq'])for(const value of ['-1','+1','1e0','1.0',' 1'])expect(()=>parseCheckpointRef(canonical({...vectors.positive[1]!.reference,[field]:value}))).toThrow();
});

test('signed integer maximum is canonical and CLOSE cannot use genesis index/revision',()=>{
 const {hash,...body}=vectors.positive[1]!.reference;const max={...body,checkpointIndex:'9223372036854775807',revision:'9223372036854775807',eventSeq:'9223372036854775807'};
 expect(parseCheckpointRef(canonical({...max,hash:digest(max)})).eventSeq).toBe(max.eventSeq);
 for(const change of [{checkpointIndex:'0'},{revision:'0'}])expect(()=>parseCheckpointRef(canonical({...body,...change,hash}))).toThrow();
});
