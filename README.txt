OBS! Credentials need to be added to all config files to run.

1. clone the repository
2. run npm install in ./mqtt/gateway    <--- (in the folder with package.json) 
3. Move 'ManagedGatewayClient.js' from ./gateway to node_modules/ibmiotf/dist/clients/       <--- replacing the one in there
4. run node gateway in mqtt/gateway/gateway/



## The step execution
git clone <our git>
cd mqtt/gateway/
npm install
cp ManagedGatewayClient /node_modules/ibmiotf/dist/clients/
node gateway_app.js
