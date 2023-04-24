import requests
print("python is here")

url = "https://sensitive-content-detection-project.s3.ap-northeast-1.amazonaws.com/1e36e4434ea147ff579fa915fdd1a96d478046ce9bf3fbfc839e83a3aedb648f?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAYTWHHTOGIT77R6AO%2F20230421%2Fap-northeast-1%2Fs3%2Faws4_request&X-Amz-Date=20230421T212509Z&X-Amz-Expires=3600&X-Amz-Signature=36276a2fb01bf70649ceb8f182dee6da46b073c92010a07ef8191607ed5ed23f&X-Amz-SignedHeaders=host&x-id=GetObject"
response =requests.get(url)
with open("C:\\Users\\user01\\桌面\\AWStest1\\python\\video1.mp4",'wb') as f :
    f.write(response.content)

