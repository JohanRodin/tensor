# <div align="center">Deep learning models using Watson Studio Neural Network Modeler and Experiments</div>

## <div align="center">Build a your own training definition for the signature fraud experiment</div>


As an addendum to the lab "[Build a model that detects signature fraud](https://github.com/IBM-DIS/workshop)" this instruction walks through how to add your own training source code to the experiment.

If the generated training definition fails to load, use the "New training definition" and upload the zip file as the training source code.

### Step 1. Download the .zip file. Unzip it to a directory on your computer. Open .yml file for editing.

### Step 2. Locate the section called training data reference name in the .yml file. Add your COS credentials. You need to change the access_key_id, secret_access_key and bucket name.

![](images/02.png)

### Step 3. Save the file and add it back to the zip file. 

### Step 4. In the add training definition dialog, add your zip file as the source code.

![](images/01.png)
