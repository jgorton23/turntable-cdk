import { Stack, StackProps, SecretValue } from "aws-cdk-lib";
import {
  UserPool,
  UserPoolClient,
  UserPoolDomain,
  UserPoolIdentityProviderApple,
  UserPoolIdentityProviderGoogle,
  OAuthScope,
  UserPoolClientIdentityProvider,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { AppleIdPConfig, GoogleIdPConfig, Stage } from "../config";

export interface CognitoStackProps extends StackProps {
  stage: Stage;
  idpConfig?: {
    apple?: AppleIdPConfig;
    google?: GoogleIdPConfig;
  }
}

export class CognitoStack extends Stack {
  readonly userPool: UserPool;
  readonly userPoolClient: UserPoolClient;
  readonly userPoolDomain: UserPoolDomain;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: `turntable-${props.stage.toLowerCase()}`,
      selfSignUpEnabled: true,
      signInAliases: { username: true, email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: true, mutable: true },
      },
    });

    const supportedProviders = [];

    if (props.idpConfig?.google) {
      const googleIdp = new UserPoolIdentityProviderGoogle(this, 'GoogleIdP', {
        userPool: this.userPool,
        clientId: props.idpConfig.google.clientId,
        clientSecretValue: SecretValue.secretsManager(props.idpConfig.google.clientSecretName),
        scopes: ['email', 'profile', 'openid'],
        attributeMapping: {
          email: { attributeName: 'email' },
          fullname: { attributeName: 'name' },
        },
      });
      supportedProviders.push(UserPoolClientIdentityProvider.GOOGLE);
      this.userPool.node.addDependency(googleIdp);
    }

    if (props.idpConfig?.apple) {
      const appleIdp = new UserPoolIdentityProviderApple(this, 'AppleIdP', {
        userPool: this.userPool,
        clientId: props.idpConfig.apple.clientId,
        teamId: props.idpConfig.apple.teamId,
        keyId: props.idpConfig.apple.keyId,
        privateKey: SecretValue.secretsManager(props.idpConfig.apple.privateKeySecretName).unsafeUnwrap(),
        scopes: ['name', 'email'],
        attributeMapping: {
          email: { attributeName: 'email' },
          fullname: { attributeName: 'name' },
        },
      });
      supportedProviders.push(UserPoolClientIdentityProvider.APPLE);
      this.userPool.node.addDependency(appleIdp);
    }

    this.userPoolClient = this.userPool.addClient('AppClient', {
      generateSecret: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      supportedIdentityProviders: supportedProviders,
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
        callbackUrls: [`https://turntable-${props.stage.toLowerCase()}.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`],
        logoutUrls: [`https://turntable-${props.stage.toLowerCase()}.auth.us-east-1.amazoncognito.com/logout`],
      },
    });

    this.userPoolDomain = this.userPool.addDomain('Domain', {
      cognitoDomain: {
        domainPrefix: `turntable-${props.stage.toLowerCase()}`,
      },
    });
  }
}
