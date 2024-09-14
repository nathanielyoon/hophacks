export const hungarian = (weights: ArrayLike<number>[]) => {
  const a = weights.length, b = new Float64Array(a);
  if (!a) return b;
  const c = weights[0].length;
  if (!c) return new Float64Array();
  const d = c + 1, e = new Float64Array(d), f = new Int32Array(d);
  const g = new Int32Array(d), h = new Float64Array(d).fill(-1);
  const i = new Float64Array(d);
  let z = 0, y, x, j, k, l;
  do {
    e.fill(Infinity), f.fill(j = -1), g.fill(0), h[k = c] = z;
    do {
      g[k] = 1, l = Infinity, x = y = 0;
      do if (!g[y]) {
        const n = weights[h[k]][y] - b[h[k]] - i[y];
        if (n < e[y]) e[y] = n, f[y] = k;
        if (e[y] < l) l = e[y], j = y;
      } while (++y < c);
      do g[x] ? (b[h[x]] += l, i[x] -= l) : e[x] -= l; while (x++ < c);
    } while (~h[k = j]);
    do h[k] = h[k = f[k]]; while (k !== c);
  } while (++z < a);
  return h[c] = -i[c], h.subarray(0, -1);
};
export type Edges = [vertex_1: number, vertex_2: number, weight: number][];
export class Blossom {
  limit = 1e9;
  A!: number;
  B!: number;
  ok!: Uint8Array;
  point!: Int32Array;
  var!: Float64Array;
  in!: Int32Array;
  label!: Uint8Array;
  end!: Int32Array;
  next!: number[][];
  best!: Int32Array;
  edge!: number[][];
  up!: Int32Array;
  down!: number[][];
  parent!: Int32Array;
  child!: number[][];
  open!: number[];
  mate!: Int32Array;
  queue: number[] = [];
  constructor(private edges: number[][], private max_cardinality = false) {
    const a = edges.length;
    if (!a) return;
    this.ok = new Uint8Array(a), this.point = new Int32Array(a + a);
    let b = 0, c = 0, d, z = 0;
    do d = edges[z],
      (this.point[z + z] = d[0]) < b || (b = d[0] + 1),
      (this.point[z + ++z] = d[1]) < b || (b = d[1] + 1),
      d[2] > c && (c = d[2]); while (z < a);
    this.var = new Float64Array(this.B = b + b).fill(c, 0, this.A = b);
    this.in = new Int32Array(b), this.label = new Uint8Array(c = b + b);
    this.end = new Int32Array(c).fill(-1), this.next = Array<number[]>(b);
    this.best = new Int32Array(c).fill(-1), this.edge = Array<number[]>(c);
    this.up = new Int32Array(c).fill(-1), this.down = Array<number[]>(c);
    this.parent = new Int32Array(c).fill(-1), this.child = Array<number[]>(c);
    this.open = Array<number>(b), this.mate = new Int32Array(b).fill(-1);
    while (c--, b--) {
      this.down[this.in[b] = this.up[b] = b] = [], this.child[b] = [];
      this.down[this.open[b] = c] = [], this.child[c] = [];
      this.edge[b] = [], this.edge[c] = [], this.next[b] = [];
    }
    while (++b < a) {
      this.next[edges[b][0]].push(b + b + 1);
      this.next[edges[b][1]].push(b + b);
    }
  }
  private leaf(at: number) {
    if (at < this.A) return [at];
    const a = [], b = this.child[at];
    for (let z = 0; z < b.length; ++z) {
      b[z] > this.A ? a.push.apply(a, this.leaf(b[z])) : a.push(b[z]);
    }
    return a;
  }
  get min() {
    let a: number = this.var[0], z = 0;
    while (++z < this.A) if (this.var[z] < a) a = this.var[z];
    return a;
  }
  slack(edge: number) {
    const a = this.edges[edge];
    return this.var[a[0]] + this.var[a[1]] - a[2] * 2;
  }
  set(from: number, label: number, to: number) {
    let a = this.in[from];
    this.label[from] = this.label[a] = label, this.end[from] = this.end[a] = to;
    this.best[from] = this.best[a] = -1;
    if (label === 1) this.queue.push.apply(this.queue, this.leaf(a));
    else this.set(this.point[a = this.mate[this.up[a]]], 1, a ^ 1);
  }
  expand(at: number, done: boolean) {
    const a = this.child[at], b = this.down[at];
    for (let z = 0; z < a.length; ++z) {
      const b = a[z];
      this.parent[b] = -1;
      if (b < this.A) this.in[b] = b;
      else if (done && this.var[b] === 0) this.expand(b, done);
      else for (let y = 0, d = this.leaf(b); y < d.length;) this.in[d[y++]] = b;
    }
    if (!done && this.label[at] === 2) {
      const c = this.in[this.point[this.end[at] ^ 1]];
      let d = this.end[at], e = a.indexOf(c), f, g, h, i;
      if (e & 1) f = 1, g = i = 0, h = this.child[at].length;
      else f = -1, g = 1, h = 0, i = this.child[at].length;
      while (e !== h) {
        this.label[this.point[b[e - g] ^ g ^ 1]] = 0;
        this.label[this.point[d ^ 1]] = 0, this.set(this.point[d ^ 1], 2, d);
        this.ok[b[e - g] >>> 1] = 1, e += f;
        d = b[e - g] ^ g, this.ok[d >>> 1] = 1, e += f;
      }

      this.label[this.point[d ^ 1]] = this.label[e = this.child[at][0]] = 2;
      this.end[this.point[d ^ 1]] = this.end[e] = d, this.best[e] = -1;
      while (this.child[at][i += f] !== c) {
        if (this.label[e = this.child[at][i]] !== 1) {
          for (let z = 0, j = this.leaf(e); z < j.length; ++z) {
            if (this.label[g = j[z]]) {
              this.label[g] = this.label[this.point[this.mate[this.up[e]]]] = 0;
              this.set(g, 2, this.end[g]);
              break;
            }
          }
        }
      }
    }
    this.end[at] = this.up[at] = this.best[at] = -1, this.edge[at].length = 0;
    b.length = this.label[at] = this.child[at].length = 0, this.open.push(at);
  }
  add(at: number, vertex: number) {
    let a = vertex;
    while (this.parent[a] !== at) a = this.parent[a];
    a < this.A || this.add(a, vertex);
    const b = this.child[at], c = this.down[at], d = b.indexOf(a);
    let e = d, f, g, h, i;
    if (d & 1) f = 1, g = 0, h = b.length;
    else f = -1, g = 1, h = 0;
    while (e !== h) {
      a = b[e += f], i = c[e - g] ^ g, a < this.A || this.add(a, this.point[i]);
      e += f, a = b[e % b.length], a < this.A || this.add(a, this.point[i ^ 1]);
      this.mate[this.point[this.mate[this.point[i]] = i ^ 1]] = i;
    }
    b.push.apply(b, b.splice(0, d)), c.push.apply(c, c.splice(0, d));
    this.up[at] = this.up[b[0]];
  }
  match() {
    if (!this.edges.length) return new Int32Array();
    let z = this.A;
    z: do {
      let y = this.queue.length = 0, x = this.A, a = 0, b;
      this.label.fill(0), this.ok.fill(0), this.best.fill(-1);
      do this.mate[y] !== -1 || this.label[this.in[y]] || this.set(y, 1, -1),
        this.edge[x++] = []; while (++y < this.A);
      do {
        while (this.queue.length && !a) {
          const c = this.queue.pop()!, d = this.next[c];
          y: for (y = 0; y < d.length; ++y) {
            const e = d[y], f = e >>> 1, g = this.point[e];
            if (this.in[c] !== this.in[g]) {
              if ((this.ok[f] ||= +((b = this.slack(f)) <= 0))) {
                switch (this.label[this.in[g]]) {
                  case 0:
                    this.set(g, 2, e ^ 1);
                    break;
                  case 1: {
                    let h = c, i = -1, j = g, k, l: number[] = [];
                    while (~h || ~j) {
                      if (this.label[k = this.in[h]] & 4) {
                        i = this.up[k];
                        break;
                      }
                      l.push(k), this.label[k] = 5;
                      h = ~this.end[k]
                        ? this.point[
                          this.end[k = this.in[this.point[this.end[k]]]]
                        ]
                        : -1, ~j && (h ^= j ^ (j = h));
                    }
                    for (x = 0; x < l.length; ++x) this.label[l[x]] = 1;
                    if (i < 0) {
                      for (x = 0, a = 1; x < 2; ++x) {
                        h = this.edges[f][x], j = f + f + 1 - x;
                        do {
                          const o = this.in[h];
                          o < this.A || this.add(o, h), this.mate[h] = j;
                          if (!~this.end[o]) break;
                          const p = this.in[this.point[this.end[o]]];
                          const q = this.end[p], r = this.point[q ^ 1];
                          h = this.point[this.mate[r] = q];
                          p < this.A || this.add(p, r), j = q ^ 1;
                        } while (--this.limit);
                      }
                      break y;
                    } else {
                      i = this.in[this.up[h = this.open.pop()!] = i];
                      let m = this.in[j = this.edges[f][0]];
                      let n = this.in[k = this.edges[f][1]];
                      this.parent[h] = -1, l = this.child[h] = [];
                      const o: number[] = this.down[this.parent[i] = h] = [];
                      while (m !== i) {
                        this.parent[m] = h, l.push(m), o.push(this.end[m]);
                        m = this.in[j = this.point[this.end[m]]];
                      }
                      l.reverse().unshift(i), o.reverse().push(f + f);
                      while (n !== i) {
                        this.parent[n] = h, l.push(n), o.push(this.end[n] ^ 1);
                        n = this.in[k = this.point[this.end[n]]];
                      }
                      this.label[h] = 1, this.end[h] = this.end[i];
                      const p = this.leaf(h);
                      for (x = this.var[h] = 0; x < p.length; ++x) {
                        this.label[this.in[i = p[x]]] === 2 &&
                        this.queue.push(i), this.in[i] = h;
                      }
                      const q = new Int32Array(this.B).fill(-1);
                      x = 0;
                      do {
                        let r = this.edge[j = l[x]];
                        if (!r.length) {
                          r = [];
                          const s = this.leaf(j);
                          for (j = 0; j < s.length; ++j) {
                            const t = this.next[s[j]];
                            for (k = 0; k < t.length; ++k) r.push(t[k] >>> 1);
                          }
                        }
                        for (j = 0; j < r.length; ++j) {
                          const s = r[j], t = this.edges[s];
                          k = this.in[+!(this.in[t[1]] === h)];
                          k === h || this.label[k] !== 1 || ~q[k] &&
                              this.slack(s) < this.slack(q[k] || (q[k] = s));
                        }
                        this.edge[i].length = 0, this.best[i] = -1;
                      } while (++x < l.length);
                      x = this.edge[h].length = 0, k = q.length;
                      while (x < k) ~(i = q[x++]) && this.edge[h].push(i);
                      const r = this.edge[h];
                      if (r.length) {
                        for (x = 1, this.best[h] = r[0]; x < r.length; ++x) {
                          this.slack(i = r[x]) < this.slack(this.best[h]) &&
                            (this.best[h] = i);
                        }
                      } else this.best[h] = -1;
                    }
                    break;
                  }
                  default:
                    this.label[g] ||= (this.end[g] = e ^ 1, 2);
                }
              } else {
                this.label[this.in[g]] === 1
                  ? ~this.best[this.in[c]] &&
                      b >= this.slack(this.best[this.in[c]]) ||
                    (this.best[this.in[c]] = f)
                  : this.label[g] ||
                    ~this.best[g] && b >= this.slack(this.best[g]) ||
                    (this.best[g] = f);
              }
            }
          }
        }
        if (a) break;
        let c, d = b = y = x = 0, e, f;
        if (this.max_cardinality) c = -1, e = 0;
        else c = 1, e = this.min;
        do this.label[this.in[y]] || !~this.best[y] ||
          (f = this.slack(this.best[y])) >= e && ~c ||
          (e = f, c = 2, d = this.best[y]); while (++y < this.A);
        do ~this.parent[x] || this.label[x] !== 1 || !~this.best[x] ||
          (b = this.slack(this.best[x]), f = b / 2) >= e && ~c ||
          (e = f, c = 3, d = this.best[x]); while (++x < this.B);
        do this.up[y] < 0 || ~this.parent[y] ||
          this.label[y] !== 2 || ~c && this.var[y] >= e ||
          (e = this.var[y], c = 4, b = y); while (++y < this.B);
        ~c || (c = 1, e = Math.max(0, this.min)), y = 0, x = this.A;
        do switch (this.label[this.in[y]]) {
          case 1:
            this.var[y] -= e;
            break;
          case 2:
            this.var[y] += e;
            break;
        } while (++y < this.A);
        do this.up[y] < 0 || ~this.parent[y] || this.label[y] === 1
          ? this.var[y] += e
          : this.label[y] === 2 && (this.var[y] -= e); while (++y < this.B);
        switch (c) {
          case 2:
          case 3:
            this.queue.push(
              this.edges[d][c - 3 && +!this.label[this.in[this.edges[d][0]]]],
            ), this.ok[d] = 1;
            break;
          default:
            this.expand(b, false);
            break;
          case 1:
            break z;
        }
      } while (--this.limit);
      if (!a) break;
      do ~this.parent[x] || this.up[x] < 0 || this.label[x] !== 1 ||
        this.var[x] || this.expand(x, true); while (++x < this.B);
    } while (--z);
    z = 0;
    do this.mate[z] < 0 ||
      (this.mate[z] = this.point[this.mate[z]]); while (++z < this.A);
    return this.mate;
  }
}
export const blossom = (edges: Edges) => {
  const a = edges.length;
  if (!a) return [[], undefined] satisfies [[number, number][], number?];
  let b = 0;
  for (let z = 0; z < a; ++z) if (edges[z][2] > b) b = edges[z][2];
  const c = b + 1, d: Edges = Array(a);
  for (let z = 0, e; z < a; ++z) e = edges[z], d[z] = [e[0], e[1], c - e[2]];
  const e = new Blossom(d, true).match(), f: [number, number][] = [];
  let g;
  for (let z = 0, h = new Set<number>(); z < e.length; ++z) {
    e[z] < 0 ? g = z : h.add(z).has(e[z]) || f.push([z, e[z]]);
  }
  return [f, g] satisfies [[number, number][], number?];
};
