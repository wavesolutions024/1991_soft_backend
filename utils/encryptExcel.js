import fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const encryptExcel = async ({
  inputFile,
  outputFile,
  password,
}) => {
  const pythonScript = `
import uno
import os
import sys
import time

input_file = sys.argv[1]
output_file = sys.argv[2]
password = sys.argv[3]

local_ctx = uno.getComponentContext()

resolver = local_ctx.ServiceManager.createInstanceWithContext(
    "com.sun.star.bridge.UnoUrlResolver",
    local_ctx
)

ctx = resolver.resolve(
    "uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext"
)

smgr = ctx.ServiceManager

desktop = smgr.createInstanceWithContext(
    "com.sun.star.frame.Desktop",
    ctx
)

input_url = uno.systemPathToFileUrl(
    os.path.abspath(input_file)
)

output_url = uno.systemPathToFileUrl(
    os.path.abspath(output_file)
)

load_props = []

prop = uno.createUnoStruct(
    "com.sun.star.beans.PropertyValue"
)

prop.Name = "Hidden"
prop.Value = True

load_props.append(prop)

document = desktop.loadComponentFromURL(
    input_url,
    "_blank",
    0,
    tuple(load_props)
)

if not document:
    raise Exception("Unable to open Excel file")

store_props = []

prop = uno.createUnoStruct(
    "com.sun.star.beans.PropertyValue"
)

prop.Name = "FilterName"
prop.Value = "Calc MS Excel 2007 XML"

store_props.append(prop)

prop = uno.createUnoStruct(
    "com.sun.star.beans.PropertyValue"
)

prop.Name = "Password"
prop.Value = password

store_props.append(prop)

document.storeAsURL(
    output_url,
    tuple(store_props)
)

document.close(True)

print("Excel encrypted successfully")
`;

  const scriptPath = inputFile + ".py";

  await fs.writeFile(scriptPath, pythonScript);

  try {
    await execFileAsync(
      "python3",
      [
        scriptPath,
        inputFile,
        outputFile,
        password,
      ],
      {
        timeout: 60000,
      }
    );
  } finally {
    await fs.unlink(scriptPath).catch(() => {});
  }
};