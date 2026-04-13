import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { BG, TEAL, TEAL_LT } from '../../constants/theme';

const isWeb = Platform.OS === 'web';
const BASE  = () => `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

async function fetchToken(id: string) {
  const r = await fetch(`${BASE()}/api/tokens/${id}`);
  if (!r.ok) throw new Error('not found');
  return r.json();
}

// ─── Formatters ────────────────────────────────────────────────────────
function fmtTs(ts: any, withTime = true) {
  if (!ts?.seconds) return '—';
  const d = new Date(ts.seconds * 1000);
  const date = d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  if (!withTime) return date;
  const time = d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
  return `${date}  ·  ${time}`;
}
function elapsed(from: any, to: any) {
  if (!from?.seconds) return null;
  const end = to?.seconds ? to.seconds * 1000 : Date.now();
  const m = Math.floor((end - from.seconds * 1000) / 60000);
  if (m < 1)  return '< 1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}min`;
}
function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—'; }

// ─── Row component ──────────────────────────────────────────────────────
function Row({ icon, label, value, valueColor }: { icon:string; label:string; value?:string|null; valueColor?:string }) {
  if (!value) return null;
  return (
    <View style={S.row}>
      <View style={S.rowLeft}>
        <Text style={S.rowIcon}>{icon}</Text>
        <Text style={S.rowLabel}>{label}</Text>
      </View>
      <Text style={[S.rowValue, valueColor ? {color:valueColor} : {}]}>{value}</Text>
    </View>
  );
}

// ─── Section card ──────────────────────────────────────────────────────
function Section({ title, icon, children, accent }: { title:string; icon:string; children:React.ReactNode; accent?:string }) {
  return (
    <View style={[S.section, accent ? {borderColor:`${accent}25`} : {}]}>
      <View style={S.sectionHdr}>
        <Text style={{fontSize:12}}>{icon}</Text>
        <Text style={[S.sectionTitle, accent ? {color:accent} : {}]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Timeline step ──────────────────────────────────────────────────────
function TimelineStep({ label, ts, color, last }: { label:string; ts:any; color:string; last?:boolean }) {
  const done = !!ts?.seconds;
  return (
    <View style={S.tlRow}>
      <View style={S.tlLeft}>
        <View style={[S.tlDot, {backgroundColor: done ? color : 'rgba(255,255,255,0.1)', borderColor: done ? color : 'rgba(255,255,255,0.12)'}]}/>
        {!last && <View style={[S.tlLine, {backgroundColor: done ? `${color}40` : 'rgba(255,255,255,0.05)'}]}/>}
      </View>
      <View style={S.tlContent}>
        <Text style={[S.tlLabel, {color: done ? '#FFF' : 'rgba(255,255,255,0.3)'}]}>{label}</Text>
        {done
          ? <Text style={S.tlTime}>{fmtTs(ts)}</Text>
          : <Text style={[S.tlTime, {color:'rgba(255,255,255,0.18)'}]}>Pending</Text>}
      </View>
    </View>
  );
}

// ─── Status config ──────────────────────────────────────────────────────
function statusCfg(s: string) {
  const m: Record<string,{label:string;color:string;bg:string}> = {
    waiting:    {label:'Waiting',    color:'#A5B4FC', bg:'rgba(165,180,252,0.15)'},
    in_consult: {label:'In Consult', color:TEAL_LT,   bg:'rgba(45,212,191,0.15)'},
    done:       {label:'Consulted',  color:'#4ADE80', bg:'rgba(74,222,128,0.15)'},
    cancelled:  {label:'Not Shown',  color:'#FCD34D', bg:'rgba(252,211,77,0.15)'},
  };
  return m[s] ?? {label:capitalize(s), color:'#A5B4FC', bg:'rgba(165,180,252,0.12)'};
}

// ─── MAIN ──────────────────────────────────────────────────────────────
export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams<{id:string}>();

  const { data: tok, isLoading, error } = useQuery({
    queryKey: ['token', id],
    queryFn: () => fetchToken(id!),
    enabled: !!id,
  });

  const isEmerg  = tok?.type === 'emergency';
  const isWalkin = tok?.source === 'walkin';
  const st = tok ? statusCfg(tok.status) : null;

  const accentColor = isEmerg ? '#F87171' : isWalkin ? '#67E8F9' : '#4ADE80';
  const tokenBg     = isEmerg ? 'rgba(239,68,68,0.22)'  : isWalkin ? 'rgba(6,182,212,0.18)'  : 'rgba(13,148,136,0.22)';
  const tokenBorder = isEmerg ? 'rgba(239,68,68,0.5)'   : isWalkin ? 'rgba(6,182,212,0.45)'  : 'rgba(45,212,191,0.45)';

  const waitDuration  = elapsed(tok?.bookedAt, tok?.calledAt);
  const consultDuration = elapsed(tok?.calledAt, tok?.doneAt);

  return (
    <SafeAreaView style={S.safe} edges={['top']}>
      <View style={S.root}>
        {/* Glow decorators */}
        <View style={[S.glow1, {backgroundColor: isEmerg?'rgba(239,68,68,0.18)':'rgba(13,148,136,0.18)'}]}/>
        <View style={S.glow2}/>

        {/* Header */}
        <View style={S.hdr}>
          <TouchableOpacity onPress={() => router.back()} style={S.back}>
            <Text style={S.backTxt}>‹</Text>
          </TouchableOpacity>
          <View style={{flex:1}}>
            <Text style={S.hdrTitle} numberOfLines={1}>
              {isLoading ? 'Loading…' : (tok?.patientName ?? 'Patient Details')}
            </Text>
            <Text style={S.hdrSub}>Token #{tok?.tokenNumber ?? '—'} · {tok?.date ?? '—'}</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={S.loadWrap}>
            <ActivityIndicator color={TEAL} size="large"/>
            <Text style={S.loadTxt}>Loading patient record…</Text>
          </View>
        ) : error || !tok ? (
          <View style={S.loadWrap}>
            <Text style={{fontSize:36}}>⚠️</Text>
            <Text style={[S.loadTxt,{color:'#FCA5A5'}]}>Patient record not found</Text>
            <TouchableOpacity onPress={() => router.back()} style={S.retryBtn}>
              <Text style={S.retryTxt}>Go Back</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.scroll}>

            {/* ── HERO: Token + Status ── */}
            <View style={[S.hero, {backgroundColor:tokenBg, borderColor:tokenBorder}]}>
              {/* Glow blob inside hero */}
              <View style={[S.heroGlow, {backgroundColor:`${accentColor}30`}]}/>

              <View style={S.heroTop}>
                {/* Big token block */}
                <View style={[S.heroToken, {backgroundColor:tokenBg, borderColor:tokenBorder}]}>
                  <Text style={S.heroTokenLabel}>TOKEN</Text>
                  <Text style={S.heroTokenNum}>#{tok.tokenNumber}</Text>
                  <Text style={[S.heroTokenShift,{color:accentColor}]}>{(tok.shift??'').toUpperCase().slice(0,3)}</Text>
                </View>

                {/* Name + badges */}
                <View style={{flex:1, minWidth:0}}>
                  <Text style={S.heroName} numberOfLines={2}>{tok.patientName}</Text>

                  {/* Age + Gender row */}
                  {(tok.age || tok.gender) && (
                    <Text style={S.heroMeta}>
                      {[tok.age ? `${tok.age} yrs` : '', tok.gender === 'M' ? 'Male' : tok.gender === 'F' ? 'Female' : tok.gender ?? ''].filter(Boolean).join('  ·  ')}
                    </Text>
                  )}

                  {/* Status + Source badges */}
                  <View style={S.heroBadges}>
                    {st && (
                      <View style={[S.badge,{backgroundColor:st.bg}]}>
                        <Text style={[S.badgeTxt,{color:st.color}]}>{st.label}</Text>
                      </View>
                    )}
                    <View style={[S.badge,{backgroundColor:isEmerg?'rgba(239,68,68,0.2)':isWalkin?'rgba(6,182,212,0.2)':'rgba(34,197,94,0.2)'}]}>
                      <Text style={[S.badgeTxt,{color:accentColor}]}>{isEmerg?'⚡ Emergency':isWalkin?'🚶 Walk-in':'📱 Online'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Quick stats */}
              <View style={S.heroStats}>
                {[
                  {label:'Booked',  value:fmtTs(tok.bookedAt, false)},
                  {label:'Shift',   value:capitalize(tok.shift)},
                  {label:'Type',    value:capitalize(tok.type)},
                  {label:'Paid',    value:`₹${tok.patientPaid??0}`},
                ].map((item,i,arr) => (
                  <View key={item.label} style={[S.heroStat, i<arr.length-1 && S.heroStatBorder]}>
                    <Text style={S.heroStatVal}>{item.value}</Text>
                    <Text style={S.heroStatLbl}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── PATIENT PROFILE ── */}
            <Section title="Patient Profile" icon="👤" accent="#A5B4FC">
              <Row icon="👤" label="Full Name"     value={tok.patientName}/>
              <Row icon="📞" label="Phone"         value={tok.patientPhone || null}/>
              <Row icon="📅" label="Age"           value={tok.age ? `${tok.age} years` : null}/>
              <Row icon="⚥"  label="Gender"        value={tok.gender === 'M' ? 'Male' : tok.gender === 'F' ? 'Female' : tok.gender ?? null}/>
              <Row icon="🏠" label="Address"       value={tok.address || null}/>
              <Row icon="📍" label="Area / City"   value={tok.area || null}/>
              {!tok.patientPhone && !tok.age && !tok.gender && !tok.address && !tok.area && (
                <Text style={S.emptySection}>No profile details recorded</Text>
              )}
            </Section>

            {/* ── BOOKING DETAILS ── */}
            <Section title="Booking Details" icon="🎟" accent={TEAL_LT}>
              <Row icon="🎟" label="Token Number"  value={`#${tok.tokenNumber}`}/>
              <Row icon="📆" label="Date"          value={tok.date}/>
              <Row icon="🌅" label="Shift"         value={capitalize(tok.shift)}/>
              <Row icon="📡" label="Source"        value={isWalkin ? 'Walk-in (Clinic)' : 'Online (Patient App)'}
                   valueColor={accentColor}/>
              <Row icon="⚡" label="Priority"      value={capitalize(tok.type)}
                   valueColor={isEmerg ? '#F87171' : '#4ADE80'}/>
              <Row icon="🕐" label="Booked At"     value={fmtTs(tok.bookedAt)}/>
              <Row icon="🆔" label="Token ID"      value={tok.id}/>
            </Section>

            {/* ── STATUS TIMELINE ── */}
            <Section title="Visit Timeline" icon="⏱" accent="#FCD34D">
              <View style={{marginTop:4}}>
                <TimelineStep label="Token Booked"      ts={tok.bookedAt}  color="#A5B4FC"/>
                <TimelineStep label="Called In"         ts={tok.calledAt}  color={TEAL_LT}/>
                <TimelineStep label="Consultation Done" ts={tok.doneAt}    color="#4ADE80" last/>
              </View>

              {waitDuration && (
                <View style={S.durationRow}>
                  <Text style={S.durationLabel}>Wait before call</Text>
                  <Text style={[S.durationVal,{color:'#FCD34D'}]}>{waitDuration}</Text>
                </View>
              )}
              {consultDuration && (
                <View style={S.durationRow}>
                  <Text style={S.durationLabel}>Consultation duration</Text>
                  <Text style={[S.durationVal,{color:'#4ADE80'}]}>{consultDuration}</Text>
                </View>
              )}
            </Section>

            {/* ── PAYMENT DETAILS ── */}
            <Section title="Payment & Fees" icon="💳" accent="#4ADE80">
              <Row icon="💰" label="Patient Paid"   value={`₹${tok.patientPaid ?? 0}`}   valueColor="#4ADE80"/>
              <Row icon="👨‍⚕️" label="Doctor Earns"  value={`₹${tok.doctorEarns ?? 0}`}   valueColor={TEAL_LT}/>
              <Row icon="🏦" label="Platform Fee"   value={`₹${tok.platformFee ?? 0}`}    valueColor="rgba(255,255,255,0.4)"/>
              <Row icon="📋" label="Payment Status" value={capitalize(tok.paymentStatus ?? 'pending')}
                   valueColor={tok.paymentStatus === 'paid' ? '#4ADE80' : '#FCD34D'}/>
              {tok.paymentId && (
                <Row icon="🔑" label="Payment ID" value={tok.paymentId}/>
              )}
            </Section>

            {/* ── NOTES ── */}
            {tok.notes && (
              <Section title="Notes" icon="📝" accent="#FCD34D">
                <View style={S.notesBox}>
                  <Text style={S.notesTxt}>{tok.notes}</Text>
                </View>
              </Section>
            )}

            {/* ── RAW DATA BADGE ── */}
            <View style={S.rawBadge}>
              <Text style={S.rawBadgeTxt}>Record ID: {tok.id}</Text>
            </View>

          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  safe: { flex:1, backgroundColor:BG, ...(isWeb&&{paddingTop:44}) },
  root: { flex:1, backgroundColor:BG },
  glow1:{ position:'absolute', top:-50, left:-50, width:180, height:180, borderRadius:90 },
  glow2:{ position:'absolute', top:280, right:-50, width:140, height:140, borderRadius:70, backgroundColor:'rgba(99,102,241,0.12)' },
  scroll:{ padding:16, paddingBottom:100, gap:10 },

  // Header
  hdr:    { flexDirection:'row', alignItems:'center', gap:12, paddingHorizontal:16, paddingTop:12, paddingBottom:8 },
  back:   { width:36, height:36, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', alignItems:'center', justifyContent:'center', flexShrink:0 },
  backTxt:{ fontSize:22, color:'#FFF', fontWeight:'300', lineHeight:28 },
  hdrTitle:{ fontSize:17, fontWeight:'900', color:'#FFF', letterSpacing:-0.3 },
  hdrSub:{ fontSize:10, color:'rgba(255,255,255,0.3)', fontWeight:'600', marginTop:1 },

  // Load
  loadWrap:{ flex:1, alignItems:'center', justifyContent:'center', gap:14 },
  loadTxt: { fontSize:13, color:'rgba(255,255,255,0.3)', fontWeight:'600' },
  retryBtn:{ paddingHorizontal:20, paddingVertical:10, borderRadius:14, backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1, borderColor:'rgba(255,255,255,0.12)' },
  retryTxt:{ fontSize:12, fontWeight:'800', color:'rgba(255,255,255,0.6)' },

  // Hero card
  hero:     { borderRadius:22, padding:16, borderWidth:1.5, overflow:'hidden', marginBottom:2 },
  heroGlow: { position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:60 },
  heroTop:  { flexDirection:'row', gap:14, alignItems:'flex-start', marginBottom:16 },
  heroToken:{ width:68, height:68, borderRadius:18, alignItems:'center', justifyContent:'center', borderWidth:1.5, flexShrink:0 },
  heroTokenLabel:{ fontSize:8, fontWeight:'700', color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:0.5 },
  heroTokenNum:{ fontSize:24, fontWeight:'900', color:'#FFF', letterSpacing:-1, lineHeight:28 },
  heroTokenShift:{ fontSize:9, fontWeight:'800', textTransform:'uppercase', letterSpacing:0.4, marginTop:1 },
  heroName: { fontSize:18, fontWeight:'900', color:'#FFF', letterSpacing:-0.4, marginBottom:4, lineHeight:22 },
  heroMeta: { fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:'600', marginBottom:6 },
  heroBadges:{ flexDirection:'row', gap:6, flexWrap:'wrap' },
  heroStats:{ flexDirection:'row', borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.1)', paddingTop:12 },
  heroStat:{ flex:1, alignItems:'center' },
  heroStatBorder:{ borderRightWidth:1, borderRightColor:'rgba(255,255,255,0.1)' },
  heroStatVal:{ fontSize:12, fontWeight:'800', color:'#FFF', letterSpacing:-0.3 },
  heroStatLbl:{ fontSize:8, fontWeight:'700', color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:0.4, marginTop:2 },

  // Section
  section:{ borderRadius:18, backgroundColor:'rgba(255,255,255,0.04)', borderWidth:1.5, borderColor:'rgba(255,255,255,0.08)', padding:14 },
  sectionHdr:{ flexDirection:'row', alignItems:'center', gap:6, marginBottom:12 },
  sectionTitle:{ fontSize:11, fontWeight:'800', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:0.6 },
  emptySection:{ fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:'500', textAlign:'center', paddingVertical:8 },

  // Row
  row:       { flexDirection:'row', alignItems:'center', paddingVertical:8, borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.05)' },
  rowLeft:   { flexDirection:'row', alignItems:'center', gap:7, flex:1, minWidth:0 },
  rowIcon:   { fontSize:12, width:20, textAlign:'center' },
  rowLabel:  { fontSize:11, color:'rgba(255,255,255,0.38)', fontWeight:'600', flex:1 },
  rowValue:  { fontSize:12, color:'rgba(255,255,255,0.85)', fontWeight:'700', textAlign:'right', flexShrink:0, maxWidth:'55%' },

  // Badge
  badge:   { paddingHorizontal:9, paddingVertical:4, borderRadius:20 },
  badgeTxt:{ fontSize:10, fontWeight:'800' },

  // Timeline
  tlRow:    { flexDirection:'row', gap:12, minHeight:48 },
  tlLeft:   { alignItems:'center', width:16, paddingTop:4 },
  tlDot:    { width:12, height:12, borderRadius:6, borderWidth:2 },
  tlLine:   { flex:1, width:2, marginTop:4, borderRadius:1 },
  tlContent:{ flex:1, paddingBottom:16 },
  tlLabel:  { fontSize:12, fontWeight:'800', marginBottom:2 },
  tlTime:   { fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:'600' },
  durationRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10, paddingTop:10, borderTopWidth:1, borderTopColor:'rgba(255,255,255,0.06)' },
  durationLabel:{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:'600' },
  durationVal:{ fontSize:12, fontWeight:'800' },

  // Notes
  notesBox:{ backgroundColor:'rgba(255,255,255,0.04)', borderRadius:12, padding:12, borderWidth:1, borderColor:'rgba(252,211,77,0.15)' },
  notesTxt:{ fontSize:13, color:'rgba(255,255,255,0.7)', fontWeight:'500', lineHeight:20 },

  // Raw badge
  rawBadge:{ alignItems:'center', paddingVertical:10 },
  rawBadgeTxt:{ fontSize:9, color:'rgba(255,255,255,0.12)', fontWeight:'600', letterSpacing:0.3 },
});
