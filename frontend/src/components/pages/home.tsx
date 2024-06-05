import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import { userData } from "@/store/slice/user.slice";
import { useEffect, useState } from "react";
import type { IApiError, IApiResponse, IOldVolumes } from "@/types";
import { setContainer } from "@/store/slice/container.slice";
import { updateFolder } from "@/store/slice/folder.slice";
import axios from "axios";
import { LogOutIcon } from "lucide-react";

export function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [old, setOld] = useState(false);
  const [oldVolumes, setOldVolumes] = useState<Array<IOldVolumes>>([]);
  const [values, setValues] = useState({
    name: "",
    lang: "",
  });

  function handleValueChange(field: string, value: string) {
    setValues((prevState) => ({
      ...prevState,
      [field]: value,
    }));
  }

  const user = useSelector(userData);
  useEffect(() => {
    !user.loggedIn && navigate("/login");
  }, [user]);

  async function getFiles(volumeName: string) {
    try {
      const response = await axios.get(
        `/container/get-root-structure/${volumeName}`
      );
      const jres: IApiResponse | IApiError = await response.data;
      if (!jres.success) {
        alert("Unable to get files... \nTry again later....");
        return;
      }
      dispatch(
        updateFolder({
          ...jres.data,
        })
      );
      navigate("/playground");
    } catch (error) {
      console.log(error);
    }
  }

  async function deploy() {
    if (!values.lang || !values.name) {
      alert("Name and Framework are required..");
      return;
    }

    const images = { language: "ubuntu" };

    try {
      const response = await axios.post(`/container/create`, {
        name: values.name,
        lang: values.lang,
        imageName: images.language,
      });
      const jres: IApiResponse | IApiError = await response.data;
      if (!jres.success) {
        alert("Unable to deploy... \nTry again later....");
        return;
      }
      dispatch(
        setContainer({
          wsurl: jres.data.wsurl,
          containerId: jres.data.containerId,
          containerName: jres.data.containerName,
        })
      );
      getFiles(jres.data.containerName);
    } catch (error) {
      alert("Unable to deploy... \nTry again later....");
      console.log(error);
    }
  }

  async function oldDeploy(vols: IOldVolumes) {
    try {
      const response = await axios.post(`/container/create`, {
        name: vols.volumeName,
        lang: vols.volumeLang,
        imageName: vols.volumeImage,
      });
      const jres: IApiResponse | IApiError = await response.data;
      if (!jres.success) {
        alert("Unable to deploy... \nTry again later....");
        return;
      }
      dispatch(
        setContainer({
          wsurl: jres.data.wsurl,
          containerId: jres.data.containerId,
          containerName: jres.data.containerName,
        })
      );
      getFiles(jres.data.containerName);
    } catch (error: any) {
      console.log(error);
      if (error.response.status == 409)
        alert("Select another name this container is already running");
      else alert("Unable to deploy... \nTry again later....");
    }
  }

  async function getProject() {
    setOld((prevState) => !prevState);
    if (!old && !oldVolumes.length) {
      try {
        const response = await axios.get(`/container/get-old-volumes`);
        const jres: IApiResponse | IApiError = await response.data;
        if (!jres.success) {
          alert("No previous projects found");
          setOld((prevState) => !prevState);
          return;
        }
        setOldVolumes(jres.data.oldVolumes);
      } catch (error) {
        alert("No previous projects found");
        setOld((prevState) => !prevState);
        console.log(error);
      }
    }
  }

  async function logout() {
    try {
      const response = await axios.post(`/user/log-out`, {
        userId: user.userId,
      });
      const jres: IApiResponse | IApiError = await response.data;
      if (!jres.success) {
        alert("Unable to logout... \nTry again later....");
        return;
      }
      dispatch({ type: "RESET" });
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Button
        onClick={logout}
        variant="outline"
        className="absolute inset-4 bg-slate-100 text-slate-950 gap-2"
      >
        <LogOutIcon className="size-9" />
        <span className="text-base">Logout</span>
      </Button>
      <div className="flex justify-center items-center h-full w-full flex-col gap-3">
        <Card className="w-[350px] text-white bg-gray-800">
          <CardHeader>
            <CardTitle>Enter existing project</CardTitle>
            <CardDescription>
              Goto your previous project in one-click.
            </CardDescription>
          </CardHeader>
          {old && (
            <CardContent className="flex flex-col bg-slate-700 m-3 mt-0 gap-2 overflow-scroll max-h-48">
              {oldVolumes.map((vols) => (
                <Button
                  variant="link"
                  key={vols._id}
                  className="w-fit"
                  onClick={() => oldDeploy(vols)}
                >
                  {vols.volumeName}
                </Button>
              ))}
            </CardContent>
          )}
          <CardFooter className="flex justify-between">
            <Button variant="ghost" className="border" onClick={getProject}>
              {old ? "Create new project" : "Get previous projects"}
            </Button>
          </CardFooter>
        </Card>
        {!old && (
          <Card className="w-[350px] text-white bg-gray-800">
            <CardHeader>
              <CardTitle>Create project</CardTitle>
              <CardDescription>
                Deploy your new project in one-click.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4  text-slate-900">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name" className="text-slate-100">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Name of your project"
                      value={values.name}
                      onChange={(e) =>
                        handleValueChange("name", e.target.value.trim())
                      }
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="framework" className="text-slate-100">
                      Framework
                    </Label>
                    <Select onValueChange={(e) => handleValueChange("lang", e)}>
                      <SelectTrigger id="framework" className="bg-slate-100">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="bg-gray-300">
                        <SelectItem value="node">Node.js</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="ccpp">C/C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" className="border" onClick={deploy}>
                Deploy
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}