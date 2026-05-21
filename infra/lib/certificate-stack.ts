import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

/**
 * Must be deployed to us-east-1 because CloudFront only accepts ACM
 * certificates from that region.
 *
 * Looks up the existing Route 53 hosted zone for nepali-europokal.de
 * (registered in AWS) and issues a DNS-validated wildcard certificate
 * covering both the apex and www subdomain.
 */
export class CertificateStack extends Stack {
  /** ARN exported so the main stack can import it cross-region. */
  public readonly certificateArn: string;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const domainName = 'nepali-europokal.de';

    // Look up the hosted zone that was created when you registered the domain.
    const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
      domainName,
    });

    // DNS-validated certificate — CDK will create the CNAME validation records
    // automatically in the hosted zone.
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames: [`www.${domainName}`],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    this.certificateArn = certificate.certificateArn;

    // Export the ARN so the main stack (in eu-central-1) can import it.
    new CfnOutput(this, 'CertificateArn', {
      value: this.certificateArn,
      exportName: 'NepalFootball-CertificateArn',
      description: 'ACM certificate ARN for nepali-europokal.de (us-east-1)',
    });
  }
}
