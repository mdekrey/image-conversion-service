$registryLoginServer = 'dekreydotnet.azurecr.io'
$k8sNamespace = 'img-convert'
$releaseName = 'img-convert'
$imageName = 'img-convert'
$imageTag = 'latest'

Push-Location "$PSScriptRoot/.."

docker build . -t "$registryLoginServer/$($imageName):$imageTag"
az acr login -n 'dekreydotnet'
docker push "$registryLoginServer/$($imageName):$imageTag"

# kubectl create configmap -n img-convert env-vars --from-env-file=.env
helm upgrade --install -n $k8sNamespace $releaseName --create-namespace --repo https://mdekrey.github.io/helm-charts single-container --set-string "image.repository=$registryLoginServer/$imageName,image.tag=$imageTag" --values ./deployment/values.yaml --values ./deployment/values.prod.yaml

Pop-Location
