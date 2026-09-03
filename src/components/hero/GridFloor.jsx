import { Grid } from '@react-three/drei'

const GridFloor = () => {
  return (
    <Grid
      position={[0, 0, 0]}
      args={[30, 30]}
      cellSize={0.5}
      cellThickness={0.55}
      cellColor="#16301c"
      sectionSize={2}
      sectionThickness={1.15}
      sectionColor="#2f6b3c"
      fadeDistance={16}
      fadeStrength={1.35}
      infiniteGrid
    />
  )
}

export default GridFloor
