declare module 'ngraph.gexf' {
  import { Graph } from 'ngraph.graph';

  type GexfModule = {
    save(graph: Graph): string;
  };

  const gexf: GexfModule;
  export default gexf;
}
