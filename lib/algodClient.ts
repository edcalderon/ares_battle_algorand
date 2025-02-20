import algosdk from 'algosdk'
import { getAlgodConfigFromEnvironment } from './getAlgoClientConfigs'

const algodConfig = getAlgodConfigFromEnvironment()
const algodClient = new algosdk.Algodv2(
    algodConfig.token as string,
    algodConfig.server, 
    algodConfig.port
)

export default algodClient