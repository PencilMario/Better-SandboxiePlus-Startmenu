export namespace main {
	
	export class FileInfo {
	    name: string;
	    path: string;
	    type: string;
	    icon?: string;
	
	    static createFrom(source: any = {}) {
	        return new FileInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.type = source["type"];
	        this.icon = source["icon"];
	    }
	}
	export class AppState {
	    folderPaths: string[];
	    currentFolder: string;
	    files: FileInfo[];
	    selectedSandbox: string;
	    availableSandboxes: string[];
	
	    static createFrom(source: any = {}) {
	        return new AppState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.folderPaths = source["folderPaths"];
	        this.currentFolder = source["currentFolder"];
	        this.files = this.convertValues(source["files"], FileInfo);
	        this.selectedSandbox = source["selectedSandbox"];
	        this.availableSandboxes = source["availableSandboxes"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class LaunchResponse {
	    success: boolean;
	    message: string;
	    pid: number;
	
	    static createFrom(source: any = {}) {
	        return new LaunchResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.message = source["message"];
	        this.pid = source["pid"];
	    }
	}

}

