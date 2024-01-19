import fs from 'fs'
const env = process.env.NODE_ENV || 'development';
console.log('Deleting existing contracts setup file for sync up')
fs.unlink('config/contract.mjs', (err) => {
  if (err) {
    console.log('Contracts Setup File does not exist, \nCreating setup file to sync up with',env);
  } else {
    console.log('File deleted successfully');
  }
});

console.log('Started ReSync Existing Contracts')




let contractFilePath = 'config/contract.json'

let setContractConfig = null
try{
  const contractSetup = fs.readFileSync(contractFilePath)
  setContractConfig = contractSetup
}catch(e){
  console.log("Failed to read",contractFilePath, "from server..")
  process.exit(1)
}

//const spec = fs.readFileSync(contractFilePath)
console.log('Please wait... Exporting JSON Contracts to JS Object')

// appendFile function with filename, content and callback function
fs.appendFile('config/contract.mjs', `export default${setContractConfig}`, function (err) {
  if (err) throw err
  console.log('Exported Contracts to JS Object is Successful')
})
