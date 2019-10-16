const interval = period => (type, sink) => {
  if (type !== 0) return;

  let i = 0;
  const id = setInterval(() => {
    sink(1, i++);
  }, period);

  sink(0, type => {
    // handle END type
    if (type === 2) {
      if (id) clearInterval(id);
    }
  });
};

const forEach = fn => source => {
  let talkBack;
  source(0, (t, d) => {
    if (t === 0) talkBack = d;
    if (t === 1) fn(d);
    if (t === 1 || t === 0) talkBack(1);
  });
};

const map = mapFn => callbag => (type, sink) => {
  if (type !== 0) return;

  callbag(0, (t, d) => {
    if (t === 1) {
      sink(t, mapFn(d));
    } else {
      sink(t, d);
    }
  });
};

const take = n => source => (type, sink) => {
  if (type !== 0) return;

  let count = 0;
  let sourceTalkBack;
  function protectedTalkBack(t, d) {
    if (count < n) sourceTalkBack(t, d);
  }
  source(0, (t, d) => {
    if (t === 0) {
      // on initialize, remember the original talkback
      sourceTalkBack = d;
      // but register with the protectedTalkBack
      sink(t, protectedTalkBack);
    } else if (t === 1) {
      // only process the data if the count hasn't be achieved
      if (count < n) {
        sink(t, d);
        count++;
        // once count has been achieved, end both upstream and downstream
        if (count === n) {
          sink(2);
          sourceTalkBack(2);
        }
      }
    } else {
      sink(t, d);
    }
  });
};

const pipe = (...operators) => {
  let r = operators[0];
  for (let i = 1; i < operators.length; i++) {
    r = operators[i](r);
  }
  return r;
};

const main = async () => {
  pipe(
    interval(1000),
    take(5),
    map(i => 4 - i),
    forEach(data => console.log(`It's the final countdown: ${data}`))
  );
};

main();
